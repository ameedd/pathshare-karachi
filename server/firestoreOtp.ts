import crypto from 'crypto';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "";
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "ameed-ai-orchestrator";
const FIRESTORE_DB_ID = process.env.FIRESTORE_DATABASE_ID || "ai-studio-remixpathshareca-4b002e40-4679-45e2-a073-d650b01dc6c3";
const SERVER_NONCE = process.env.SERVER_NONCE || crypto.randomBytes(16).toString('hex');

// Cache for GCP Cloud Run IAM Service Account Token
let cachedGcpToken: { token: string; expiresAt: number } | null = null;

/**
 * Attempts to retrieve a Google Cloud IAM Service Account token
 * Supports Cloud Run instance metadata server or GCP_ACCESS_TOKEN env var
 */
async function getGcpIamToken(): Promise<string | null> {
  if (process.env.GCP_ACCESS_TOKEN) {
    return process.env.GCP_ACCESS_TOKEN.trim();
  }

  const now = Date.now();
  if (cachedGcpToken && cachedGcpToken.expiresAt > now + 60000) {
    return cachedGcpToken.token;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-account/default/token', {
      headers: { 'Metadata-Flavor': 'Google' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.access_token) {
        cachedGcpToken = {
          token: data.access_token,
          expiresAt: now + (data.expires_in || 3600) * 1000,
        };
        return data.access_token;
      }
    }
  } catch {
    // Expected outside of GCP Cloud Run container
  }

  return null;
}

export interface OtpDocument {
  targetKey: string;
  code: string;
  channel: string;
  handset?: string;
  status: 'pending' | 'verified' | 'expired';
  attempts: number;
  createdAt: string;
  expiresAt: string;
}

// In-memory L1 cache for sub-millisecond local responses
const memoryL1Cache = new Map<string, OtpDocument>();

function getFirestoreDocUrl(docId: string): string {
  const safeId = encodeURIComponent(docId.replace(/[^a-zA-Z0-9_-]/g, '_'));
  const base = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DB_ID}/documents/otpVerifications/${safeId}`;
  return FIREBASE_API_KEY ? `${base}?key=${FIREBASE_API_KEY}` : base;
}

export async function saveOtpToFirestore(
  targetKey: string,
  code: string,
  channel: string = 'whatsapp',
  handset?: string,
  expiresInSeconds: number = 600
): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

  const docData: OtpDocument = {
    targetKey,
    code,
    channel,
    handset,
    status: 'pending',
    attempts: 0,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // 1. Update in-memory L1 cache
  memoryL1Cache.set(targetKey, docData);

  // 2. Persist to Firestore L2 for Cloud Run multi-instance persistence
  try {
    const iamToken = await getGcpIamToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (iamToken) {
      headers['Authorization'] = `Bearer ${iamToken}`;
    }

    const url = getFirestoreDocUrl(targetKey);
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        fields: {
          targetPhone: { stringValue: targetKey },
          code: { stringValue: code },
          channel: { stringValue: channel },
          handset: { stringValue: handset || '' },
          status: { stringValue: 'pending' },
          attempts: { integerValue: '0' },
          serverNonce: { stringValue: SERVER_NONCE },
          createdAt: { timestampValue: now.toISOString() },
          expiresAt: { timestampValue: expiresAt.toISOString() },
        },
      }),
    });

    if (!res.ok) {
      if (res.status === 403) {
        console.log(`[Firestore OTP] Firestore rules require server token; utilizing fast in-memory L1 cache.`);
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[Firestore OTP] Firestore L2 save status (${res.status}): ${errText}`);
      }
    } else {
      console.log(`[Firestore OTP] Code securely persisted in Firestore for ${targetKey} (TTL: ${expiresInSeconds}s)`);
    }
    return true;
  } catch (err: any) {
    console.warn(`[Firestore OTP] Network error persisting to Firestore: ${err.message}. L1 memory cache active.`);
    return true;
  }
}

export async function verifyOtpFromFirestore(
  targetKey: string,
  submittedCode: string
): Promise<{ verified: boolean; message: string }> {
  const cleanCode = String(submittedCode || '').trim();
  if (!cleanCode) {
    return { verified: false, message: 'Verification code is required.' };
  }

  // 1. Try fetching from Firestore L2 first for cross-instance truth
  let doc: OtpDocument | null = null;
  try {
    const iamToken = await getGcpIamToken();
    const headers: Record<string, string> = {};
    if (iamToken) {
      headers['Authorization'] = `Bearer ${iamToken}`;
    }

    const url = getFirestoreDocUrl(targetKey);
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      const fields = data.fields;
      if (fields) {
        doc = {
          targetKey: fields.targetPhone?.stringValue || targetKey,
          code: fields.code?.stringValue || '',
          channel: fields.channel?.stringValue || 'whatsapp',
          handset: fields.handset?.stringValue,
          status: (fields.status?.stringValue as any) || 'pending',
          attempts: parseInt(fields.attempts?.integerValue || '0', 10),
          createdAt: fields.createdAt?.timestampValue || new Date().toISOString(),
          expiresAt: fields.expiresAt?.timestampValue || new Date(0).toISOString(),
        };
      }
    }
  } catch (err: any) {
    console.warn(`[Firestore OTP] Could not fetch L2 Firestore doc: ${err.message}`);
  }

  // 2. Fallback to L1 cache if Firestore query failed
  if (!doc) {
    doc = memoryL1Cache.get(targetKey) || null;
  }

  if (!doc) {
    return {
      verified: false,
      message: `No active verification code found for ${targetKey}. Please request a new code.`,
    };
  }

  // Check if already verified
  if (doc.status === 'verified') {
    return { verified: false, message: 'This code has already been used. Please request a fresh code.' };
  }

  // Check expiration TTL
  const now = Date.now();
  const expireTime = new Date(doc.expiresAt).getTime();
  if (now > expireTime) {
    memoryL1Cache.delete(targetKey);
    return { verified: false, message: 'Verification code has expired. Please request a new code.' };
  }

  // Check attempts
  if (doc.attempts >= 5) {
    return { verified: false, message: 'Too many incorrect attempts. Please request a new code.' };
  }

  // Validate Code
  if (doc.code !== cleanCode) {
    doc.attempts += 1;
    memoryL1Cache.set(targetKey, doc);

    // Update attempts in Firestore
    try {
      const iamToken = await getGcpIamToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (iamToken) {
        headers['Authorization'] = `Bearer ${iamToken}`;
      }
      const url = getFirestoreDocUrl(targetKey);
      await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          fields: {
            attempts: { integerValue: String(doc.attempts) },
            serverNonce: { stringValue: SERVER_NONCE },
          },
        }),
      });
    } catch {}

    const remaining = 5 - doc.attempts;
    return {
      verified: false,
      message: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // Code matches! Mark as verified
  doc.status = 'verified';
  memoryL1Cache.delete(targetKey);

  try {
    const iamToken = await getGcpIamToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (iamToken) {
      headers['Authorization'] = `Bearer ${iamToken}`;
    }
    const url = getFirestoreDocUrl(targetKey);
    await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        fields: {
          status: { stringValue: 'verified' },
          serverNonce: { stringValue: SERVER_NONCE },
          verifiedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });
  } catch {}

  return { verified: true, message: 'Identity verified successfully.' };
}
