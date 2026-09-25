/**
 * PathShare Diagnostic & Activity Logger
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
}

const memoryLogs: LogEntry[] = [];
const MAX_LOGS = 100;

export const logger = {
  log: (level: LogLevel, context: string, message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data
    };

    memoryLogs.unshift(entry);
    if (memoryLogs.length > MAX_LOGS) {
      memoryLogs.pop();
    }

    const prefix = `[PathShare:${context}]`;
    if (level === 'error') {
      console.error(prefix, message, data || '');
    } else if (level === 'warn') {
      console.warn(prefix, message, data || '');
    } else if (level === 'debug') {
      console.debug(prefix, message, data || '');
    } else {
      console.log(prefix, message, data || '');
    }
  },

  info: (context: string, message: string, data?: any) => {
    logger.log('info', context, message, data);
  },

  warn: (context: string, message: string, data?: any) => {
    logger.log('warn', context, message, data);
  },

  error: (context: string, message: string, data?: any) => {
    logger.log('error', context, message, data);
  },

  debug: (context: string, message: string, data?: any) => {
    logger.log('debug', context, message, data);
  },

  getRecentLogs: (): LogEntry[] => {
    return [...memoryLogs];
  },

  clearLogs: () => {
    memoryLogs.length = 0;
  }
};
