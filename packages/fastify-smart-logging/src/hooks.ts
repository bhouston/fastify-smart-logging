import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { computePayloadLength } from './compute-length.js';
import { baseShouldLogFilter, errorColorFilter, evaluateFilters, slowColorFilter } from './decision.js';
import { formatErrorMainLine, formatErrorStackLine, formatResponseLine } from './format.js';
import { resolveOptions } from './options.js';
import { requestLoggedSymbol, type TimedFastifyRequest, timeoutHandleSymbol } from './symbols.js';
import { formatDurationMs, getDurationMs, getRequestStart, markRequestStart } from './timing.js';
import type { LogAction, LogContext, ResolvedLogFilterOptions, LogFilterOptions } from './types.js';

function createResponseContext(
  request: FastifyRequest,
  reply: FastifyReply,
  durationMs: number,
  payload: unknown,
): LogContext {
  return {
    phase: 'response',
    method: request.method,
    url: request.url,
    requestId: request.id,
    statusCode: reply.statusCode,
    durationMs,
    payload,
  };
}

function createErrorContext(
  request: FastifyRequest,
  reply: FastifyReply,
  durationMs: number | undefined,
  error: unknown,
): LogContext {
  return {
    phase: 'error',
    method: request.method,
    url: request.url,
    requestId: request.id,
    statusCode: reply.statusCode,
    durationMs,
    error,
  };
}

function buildFilters(options: ResolvedLogFilterOptions) {
  const filters = [baseShouldLogFilter(options), slowColorFilter(options), errorColorFilter(), ...options.filters];
  return filters;
}

export function registerFastifyLogFilter(app: FastifyInstance, options: LogFilterOptions = {}): void {
  const resolved = resolveOptions(options);
  const filters = buildFilters(resolved);
  const { logSlowResponsesThreshold, logger, maxBodyLength } = resolved;

  const logRequestLine = (request: FastifyRequest): void => {
    logger.info(`[${request.id}] ${request.method} ${request.url}`);
  };

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
    const ctx = createResponseContext(request, reply, durationMs, payload);

    const action: LogAction = evaluateFilters(ctx, filters, { visibility: 'hide' });

    if (action.visibility === 'show' && !timedRequest[requestLoggedSymbol]) {
      logRequestLine(request);
      timedRequest[requestLoggedSymbol] = true;
    }

    if (action.visibility === 'show') {
      const lenRaw = computePayloadLength(payload, reply);
      const line = formatResponseLine(ctx, action, lenRaw, maxBodyLength);
      logger.info(line);
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
    const durationMs = startNs ? getDurationMs(startNs) : undefined;

    const ctx = createErrorContext(request, reply, durationMs, err);
    const action: LogAction = evaluateFilters(ctx, filters, { visibility: 'hide' });

    if (action.visibility === 'show' && !timedRequest[requestLoggedSymbol]) {
      logRequestLine(request);
      timedRequest[requestLoggedSymbol] = true;
    }

    if (action.visibility === 'show') {
      const durationLabel = startNs ? formatDurationMs(startNs) : '';
      const mainLine = formatErrorMainLine(ctx, action, durationLabel, status);
      logger.error(mainLine);

      const stackLine = formatErrorStackLine(ctx);
      if (stackLine) {
        logger.error(stackLine);
      }
    }

    // Delegate response handling to Fastify by sending the error.
    void reply.send(err as never);
  });
}
