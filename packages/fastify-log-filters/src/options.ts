import type { LogFilters, ResolvedLogFiltersOptions, LogFiltersOptions, Logger } from './types.js';

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

export function resolveOptions(options: LogFiltersOptions = {}): ResolvedLogFiltersOptions {
  const {
    logSlowResponsesThreshold = 0,
    logNonSuccesses = true,
    maxBodyLength = defaultMaxBodyLength,
    filters = [],
    logger,
  } = options;

  const resolvedFilters: LogFilters[] = [...filters];

  return {
    logSlowResponsesThreshold,
    logNonSuccesses,
    maxBodyLength,
    filters: resolvedFilters,
    logger: resolveLogger(logger),
  };
}
