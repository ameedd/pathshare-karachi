/**
 * PathShare Telemetry, Webhook Analytics & Cloud Logging Engine
 */

export interface WebhookStatusEvent {
  messageId: string;
  recipientId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  errorCode?: string;
  errorTitle?: string;
}

export interface TelemetryStats {
  totalDispatched: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  recentEvents: WebhookStatusEvent[];
  startedAt: string;
}

const stats: TelemetryStats = {
  totalDispatched: 0,
  totalDelivered: 0,
  totalRead: 0,
  totalFailed: 0,
  recentEvents: [],
  startedAt: new Date().toISOString(),
};

/**
 * Emits GCP Cloud Logging formatted structured JSON
 */
export function logStructured(severity: 'INFO' \| 'WARNING' \| 'WARN' \| 'ERROR' \| 'CRITICAL', event: string, metadata?: Record<string, any>) {
  const payload = {
    timestamp: new Date().toISOString(),
    severity,
    service: 'pathshare-carpool-backend',
    event,
    ...metadata,
  };

  if (severity === 'ERROR') {
    console.error(JSON.stringify(payload));
  } else if (severity === 'WARNING') {
    console.warn(JSON.stringify(payload));
  } else {
    console.log(JSON.stringify(payload));
  }
}

/**
 * Records a message dispatch in telemetry
 */
export function recordDispatch(recipient: string, messageId: string) {
  stats.totalDispatched += 1;
  const event: WebhookStatusEvent = {
    messageId,
    recipientId: recipient,
    status: 'sent',
    timestamp: new Date().toISOString(),
  };
  pushEvent(event);
  logStructured('INFO', 'MessageDispatched', { recipient, messageId });
}

/**
 * Handles incoming Meta WhatsApp Webhook event payload
 */
export function handleWebhookPayload(body: any) {
  try {
    const entries = body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value;
        if (!value) continue;

        // Process message statuses (sent, delivered, read, failed)
        const statuses = value.statuses || [];
        for (const s of statuses) {
          const status = s.status as 'sent' | 'delivered' | 'read' | 'failed';
          const messageId = s.id;
          const recipientId = s.recipient_id;
          const errors = s.errors || [];
          const firstErr = errors[0];

          if (status === 'delivered') stats.totalDelivered += 1;
          if (status === 'read') stats.totalRead += 1;
          if (status === 'failed') stats.totalFailed += 1;

          const event: WebhookStatusEvent = {
            messageId,
            recipientId,
            status,
            timestamp: s.timestamp ? new Date(parseInt(s.timestamp, 10) * 1000).toISOString() : new Date().toISOString(),
            errorCode: firstErr?.code ? String(firstErr.code) : undefined,
            errorTitle: firstErr?.title || firstErr?.message,
          };

          pushEvent(event);
          logStructured(
            status === 'failed' ? 'ERROR' : 'INFO',
            `WhatsAppDeliveryReceipt_${status.toUpperCase()}`,
            { messageId, recipientId, status, error: event.errorTitle }
          );
        }

        // Process inbound user replies (e.g. rider replied to WhatsApp message)
        const messages = value.messages || [];
        for (const m of messages) {
          const from = m.from;
          const text = m.text?.body || '';
          logStructured('INFO', 'WhatsAppInboundUserMessage', { from, text });
        }
      }
    }
  } catch (err: any) {
    logStructured('ERROR', 'WebhookPayloadParseError', { error: err.message });
  }
}

function pushEvent(event: WebhookStatusEvent) {
  stats.recentEvents.unshift(event);
  if (stats.recentEvents.length > 50) {
    stats.recentEvents.pop();
  }
}

export function getWebhookTelemetry(): TelemetryStats {
  return { ...stats };
}

/**
 * Runs an in-container benchmark stress test simulating 100 concurrent ride booking requests
 */
export async function runConcurrencyStressTest(concurrency: number = 100): Promise<{
  totalRequests: number;
  successful: number;
  failed: number;
  durationMs: number;
  latencies: {
    minMs: number;
    maxMs: number;
    avgMs: number;
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
  };
  throughputReqSec: number;
}> {
  const start = Date.now();
  const latencies: number[] = [];
  let successful = 0;
  let failed = 0;

  // Simulate concurrent bookings for Karachi corridors
  const tasks = Array.from({ length: concurrency }).map(async (_, idx) => {
    const t0 = performance.now();
    try {
      // Simulate transaction: seat lock, fare calc, receipt generation
      await new Promise((res) => setTimeout(res, 5 + Math.random() * 20));
      const t1 = performance.now();
      latencies.push(t1 - t0);
      successful++;
    } catch {
      failed++;
    }
  });

  await Promise.all(tasks);
  const totalDuration = Date.now() - start;

  latencies.sort((a, b) => a - b);
  const minMs = latencies[0] || 0;
  const maxMs = latencies[latencies.length - 1] || 0;
  const avgMs = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const p50Ms = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95Ms = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99Ms = latencies[Math.floor(latencies.length * 0.99)] || 0;

  return {
    totalRequests: concurrency,
    successful,
    failed,
    durationMs: totalDuration,
    latencies: {
      minMs: Math.round(minMs * 100) / 100,
      maxMs: Math.round(maxMs * 100) / 100,
      avgMs: Math.round(avgMs * 100) / 100,
      p50Ms: Math.round(p50Ms * 100) / 100,
      p95Ms: Math.round(p95Ms * 100) / 100,
      p99Ms: Math.round(p99Ms * 100) / 100,
    },
    throughputReqSec: Math.round((concurrency / (totalDuration / 1000)) * 10) / 10,
  };
}
