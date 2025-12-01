import chalk from 'chalk';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { humanizeBytes, humanizeTime } from 'humanize-units';

// Symbol keys used only for internal tracking; names are not sensitive.
const startTimeSymbol = Symbol('startTime');
// biome-ignore lint/security/noSecrets: Symbol description only, not a secret.
const requestLoggedSymbol = Symbol('requestLoggedFlag');
// biome-ignore lint/security/noSecrets: Symbol description only, not a secret.
const timeoutHandleSymbol = Symbol('timeoutHandleFlag');

type TimedFastifyRequest = FastifyRequest & {
  [startTimeSymbol]?: bigint;
  [requestLoggedSymbol]?: boolean;
  [timeoutHandleSymbol]?: NodeJS.Timeout;
};

const markRequestStart = (request: FastifyRequest): void => {
  (request as TimedFastifyRequest)[startTimeSymbol] = process.hrtime.bigint();
};

const getRequestStart = (request: FastifyRequest): bigint | undefined =>
  (request as TimedFastifyRequest)[startTimeSymbol];

function formatDurationMs(startNs: bigint): string {
  const endNs = process.hrtime.bigint();
  const diffNs = endNs - startNs;
  const ms = Number(diffNs) / 1_000_000; // ns -> ms
  const rounded = Math.round(ms * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}ms` : `${rounded.toFixed(1)}ms`;
}

function getDurationMs(startNs: bigint): number {
  const endNs = process.hrtime.bigint();
  const diffNs = endNs - startNs;
  return Number(diffNs) / 1_000_000; // ns -> ms
}

function logRequestLine(request: FastifyRequest): void {
  // eslint-disable-next-line no-console
  console.log(`[${request.id}] ${request.method} ${request.url}`);
}

export type ConciseLoggingOptions = {
  logSlowResponsesThreshold?: number;
  logNonSuccesses?: boolean;
};

function shouldLogRequest(durationMs: number, statusCode: number, options: ConciseLoggingOptions): boolean {
  const { logSlowResponsesThreshold = 0, logNonSuccesses = true } = options;

  if (logSlowResponsesThreshold > 0 && durationMs >= logSlowResponsesThreshold) {
    return true;
  }

  if (logNonSuccesses && (statusCode < 200 || statusCode >= 300)) {
    return true;
  }

  if (logSlowResponsesThreshold === 0) {
    return true;
  }

  return false;
}

export function registerConciseFastifyLogging(app: FastifyInstance, options: ConciseLoggingOptions = {}) {
  const { logSlowResponsesThreshold = 0 } = options;

  app.addHook('onRequest', async (request: FastifyRequest) => {
    markRequestStart(request);
    const timedRequest = request as TimedFastifyRequest;

    if (logSlowResponsesThreshold === 0) {
      logRequestLine(request);
      timedRequest[requestLoggedSymbol] = true;
    } else if (logSlowResponsesThreshold > 0) {
      const timeoutHandle = setTimeout(() => {
        if (!timedRequest[requestLoggedSymbol]) {
          logRequestLine(request);
          timedRequest[requestLoggedSymbol] = true;
        }
      }, logSlowResponsesThreshold);
      timedRequest[timeoutHandleSymbol] = timeoutHandle;
    }
  });

  app.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
    const timedRequest = request as TimedFastifyRequest;
    const startNs = getRequestStart(request);

    if (timedRequest[timeoutHandleSymbol]) {
      clearTimeout(timedRequest[timeoutHandleSymbol]);
      delete timedRequest[timeoutHandleSymbol];
    }

    if (!startNs) {
      return payload;
    }

    const durationMs = getDurationMs(startNs);
    const statusCode = reply.statusCode;
    const shouldLog = shouldLogRequest(durationMs, statusCode, options);

    if (shouldLog && !timedRequest[requestLoggedSymbol]) {
      logRequestLine(request);
      timedRequest[requestLoggedSymbol] = true;
    }

    if (shouldLog) {
      const dur = humanizeTime(durationMs / 1000);
      const lenRaw = (() => {
        const contentLengthHeader = reply.getHeader('content-length');
        if (typeof contentLengthHeader === 'string') return Number(contentLengthHeader);
        if (typeof contentLengthHeader === 'number') return contentLengthHeader;
        if (payload && typeof payload === 'string') return Buffer.byteLength(payload);
        return;
      })();
      const len = lenRaw ? humanizeBytes(lenRaw) : undefined;

      const statusStr = (() => {
        if (statusCode >= 500) return chalk.red(`↳ ${statusCode}`);
        if (statusCode >= 400) return chalk.yellow(`↳ ${statusCode}`);
        return `↳ ${statusCode}`;
      })();

      let bodyStr: string | undefined;
      if (statusCode >= 400 && payload) {
        if (typeof payload === 'string') {
          bodyStr = payload;
        } else if (typeof payload === 'number') {
          bodyStr = String(payload);
        } else if (typeof payload === 'boolean') {
          bodyStr = String(payload);
        } else if (typeof payload === 'bigint') {
          bodyStr = String(payload);
        } else if (typeof payload === 'symbol') {
          bodyStr = String(payload);
        } else if (typeof payload === 'function') {
          bodyStr = String(payload);
        } else if (typeof payload === 'object') {
          if (payload instanceof Error) {
            bodyStr = payload.message;
          } else if (Buffer.isBuffer(payload)) {
            bodyStr = payload.toString('utf8');
          } else {
            try {
              bodyStr = JSON.stringify(payload, null, 2);
            } catch {
              bodyStr = String(payload);
            }
          }
        } else {
          bodyStr = String(payload);
        }

        const maxBodyLength = 200;
        if (bodyStr.length > maxBodyLength) {
          bodyStr = `${bodyStr.substring(0, maxBodyLength)}...`;
        }
      }

      const parts: string[] = [
        `[${request.id}] ${statusStr}`,
        bodyStr ? chalk.dim(`${bodyStr}`) : undefined,
        len ?? '???B',
        `in ${dur}`,
      ].filter(Boolean) as string[];

      // eslint-disable-next-line no-console
      console.log(parts.join(' '));
    }

    return payload;
  });

  app.setErrorHandler((err: unknown, request, reply) => {
    const timedRequest = request as TimedFastifyRequest;
    const startNs = getRequestStart(request);

    if (timedRequest[timeoutHandleSymbol]) {
      clearTimeout(timedRequest[timeoutHandleSymbol]);
      delete timedRequest[timeoutHandleSymbol];
    }

    const status = typeof reply.statusCode === 'number' ? reply.statusCode : 500;
    const durationMs = startNs ? getDurationMs(startNs) : 0;
    const shouldLog = shouldLogRequest(durationMs, status, options);

    if (shouldLog && !timedRequest[requestLoggedSymbol]) {
      logRequestLine(request);
      timedRequest[requestLoggedSymbol] = true;
    }

    if (shouldLog) {
      const dur = startNs ? formatDurationMs(startNs) : '';
      const statusStr =
        status >= 500 ? chalk.red(`${status}`) : status >= 400 ? chalk.yellow(`${status}`) : `${status}`;

      const errorMessage = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error(`[${request.id}] × ${request.method} ${request.url} → ${statusStr} ${dur} ${errorMessage}`);

      if (status >= 400 && err instanceof Error) {
        if (err.stack) {
          // eslint-disable-next-line no-console
          console.error(chalk.dim(`[${request.id}] Error stack: ${err.stack}`));
        }
      }
    }
  });
}

export const fastifySmartLogging = fp(
  async (app: FastifyInstance, options: ConciseLoggingOptions = {}) => {
    registerConciseFastifyLogging(app, options);
  },
  {
    name: 'fastify-smart-logging',
  },
);
