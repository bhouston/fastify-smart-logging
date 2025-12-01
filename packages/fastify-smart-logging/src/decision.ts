import type { LogAction, LogContext, LogFilter, ResolvedLogFilterOptions } from './types.js';

export function baseShouldLogFilter(options: ResolvedLogFilterOptions): LogFilter {
  const { logSlowResponsesThreshold, logNonSuccesses } = options;

  return (ctx) => {
    if (ctx.phase !== 'response' && ctx.phase !== 'error') {
      return null;
    }

    const statusCode = ctx.statusCode ?? 0;
    const durationMs = ctx.durationMs ?? 0;

    if (logSlowResponsesThreshold > 0 && durationMs >= logSlowResponsesThreshold) {
      return { visibility: 'show' };
    }

    if (logNonSuccesses && (statusCode < 200 || statusCode >= 300)) {
      return { visibility: 'show' };
    }

    if (logSlowResponsesThreshold === 0) {
      return { visibility: 'show' };
    }

    return { visibility: 'hide' };
  };
}

export function errorColorFilter(): LogFilter {
  return (ctx) => {
    if (ctx.phase !== 'response' && ctx.phase !== 'error') {
      return null;
    }
    const statusCode = ctx.statusCode ?? 0;
    if (statusCode >= 500) return { color: 'red', tag: 'ERROR' };
    if (statusCode >= 400) return { color: 'yellow', tag: 'WARN' };
    return null;
  };
}

export function slowColorFilter(options: ResolvedLogFilterOptions): LogFilter {
  const { logSlowResponsesThreshold } = options;

  if (logSlowResponsesThreshold <= 0) {
    return () => null;
  }

  return (ctx) => {
    if (ctx.phase !== 'response' && ctx.phase !== 'error') {
      return null;
    }
    const durationMs = ctx.durationMs ?? 0;
    if (durationMs >= logSlowResponsesThreshold) {
      return { color: 'yellow', tag: 'SLOW' };
    }
    return null;
  };
}

export function evaluateFilters(
  ctx: LogContext,
  filters: LogFilter[],
  defaultAction: LogAction = { visibility: 'hide' },
): LogAction {
  const result: LogAction = { ...defaultAction };
  for (const filter of filters) {
    const patch = filter(ctx);
    if (patch) {
      Object.assign(result, patch);
    }
  }
  return result;
}
