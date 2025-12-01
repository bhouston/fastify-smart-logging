import type { LogFilter, ResolvedLogFilterOptions, ≈, LogFilterOptions, Logger } from './types.js';

const defaultMaxBodyLength = 200;

function resolveLogger(logger?: Logger): Logger {
  if (logger) return logger;

  return {
    info(message: string) {
      // eslint-disable-next-line no-console
      console.log(message);
    },
    error(message: string) {
      // eslint-disable-next-line no-console
      console.error(message);
    },
  };
}

export function resolveOptions(options: LogFilterOptions = {}): ResolvedLogFilterOptions {
  const {
    logSlowResponsesThreshold = 0,
    logNonSuccesses = true,
    maxBodyLength = defaultMaxBodyLength,
    filters = [],
    logger,
  } = options;

  const resolvedFilters: LogFilter[] = [...filters];

  return {
    logSlowResponsesThreshold,
    logNonSuccesses,
    maxBodyLength,
    filters: resolvedFilters,
    logger: resolveLogger(logger),
  };
}
