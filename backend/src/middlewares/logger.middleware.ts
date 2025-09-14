import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import onFinished from 'on-finished';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// ---------- Config y preparación de directorio ----------
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_DIR = process.env.LOG_DIR || 'logs';
try {
  fs.mkdirSync(path.resolve(LOG_DIR), { recursive: true });
} catch (e) {
  // Último recurso: no abortar arranque por logging
   
  console.error('Failed to ensure log dir:', e);
}

// ---------- Sanitización ----------
const SENSITIVE_KEYS = [
  'password','pass','pwd','token','access_token','refresh_token','id_token',
  'authorization','cookie','api_key','apikey','secret','client_secret',
  'private_key','wallet_private_key','mnemonic','seed'
];
const MAX_DEPTH = 4;
const MAX_STRING = 256;

function sanitizeData(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'string' && value.length > MAX_STRING) return value.slice(0, MAX_STRING) + '…';
    return value;
  }
  if (seen.has(value as object)) return '[Circular]';
  if (depth >= MAX_DEPTH) return '[Truncated]';

  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map(v => sanitizeData(v, depth + 1, seen));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const lower = k.toLowerCase();
    out[k] = SENSITIVE_KEYS.some(s => lower.includes(s))
      ? '[REDACTED]'
      : sanitizeData(v, depth + 1, seen);
  }
  return out;
}

const getBodySize = (body: any): number => {
  if (!body) return 0;
  try {
    const safe = sanitizeData(body);
    return Buffer.byteLength(JSON.stringify(safe), 'utf8');
  } catch { return 0; }
};

const sanitizeUserAgent = (ua: string): string =>
  String(ua || 'unknown')
    .slice(0, 256)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/[A-Za-z0-9._-]{20,}/g, '[REDACTED_TOKEN]');

// ---------- Logger (Winston) ----------
const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || 'info',
  handleExceptions: true,
});

const fileRotateTransport = new DailyRotateFile({
  dirname: LOG_DIR,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || '10m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  level: process.env.LOG_LEVEL || 'info',
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    NODE_ENV !== 'production' ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
    winston.format.printf((info: winston.Logform.TransformableInfo) =>
      `[${info.timestamp}] ${String(info.level).toUpperCase()}: ${info.message}`
    ),
  ),
  transports: [
    ...(process.env.LOG_TO_CONSOLE === 'false' ? [] : [consoleTransport]),
    ...(process.env.LOG_TO_FILE === 'false' ? [] : [fileRotateTransport]),
  ],
  exitOnError: false,
});

// ---------- Helper de usuario ----------
const getUserId = (req: Request): string => {
  try {
    return (req as any).user?.id || (req.headers['x-user-id'] as string) || 'anonymous';
  } catch {
    return 'anonymous';
  }
};

// ---------- Middleware ----------
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  res.setHeader('x-request-id', requestId);

  const method = req.method;
  const url = req.originalUrl || req.url;
  const userId = getUserId(req);
  const userAgent = sanitizeUserAgent(String(req.headers['user-agent'] || 'unknown'));
  const contentType = String(req.headers['content-type'] || 'none');
  const bodySize = ['POST', 'PUT', 'PATCH'].includes(method) ? getBodySize((req as any).body) : 0;

  // REQ log
  logger.info(`${method} ${url} - reqId=${requestId} - user=${userId} - size=${bodySize}B - UA=${userAgent} - CT=${contentType}`);

  // RES log (sin override de res.end → evita fugas)
  onFinished(res, (err: Error | null) => {
    const endTime = process.hrtime.bigint();
    const responseTime = Math.round(Number(endTime - startTime) / 1e6); // ms
    const statusCode = res.statusCode;
    const base = `${method} ${url} - ${statusCode} - ${responseTime}ms - reqId=${requestId} - user=${userId}`;

    if (err || statusCode >= 500) {
      logger.error(`${base}${err ? ` - error=${err.message}` : ''}`);
    } else if (statusCode >= 400) {
      logger.warn(base);
    } else {
      logger.info(base);
    }
  });

  next();
};
