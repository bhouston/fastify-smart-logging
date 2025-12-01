export type LogPhase = 'request' | 'response' | 'error';

export interface LogContext {
  phase: LogPhase;
  method: string;
  url: string;
  requestId: string | number;
  statusCode?: number;
  durationMs?: number;
  payload?: unknown;
  error?: unknown;
}

export type LogVisibility = 'hide' | 'show';

export interface LogAction {
  visibility: LogVisibility;
  color?: 'red' | 'yellow' | 'dim';
  tag?: string;
}

export type LogFilter = (ctx: LogContext) => Partial<LogAction> | null | undefined;

export interface Logger {
  info(message: string): void;
  error(message: string): void;
}

export interface LogFilterOptions {
  /**
   * If > 0, responses with duration >= threshold will always be considered for logging.
   * If 0, all responses are considered (i.e. the plugin behaves like a normal access logger).
   */
  logSlowResponsesThreshold?: number;
  /**
   * If true (default), non-2xx responses are always considered for logging.
   */
  logNonSuccesses?: boolean;
  /**
   * Maximum number of characters from the response body to log for error responses.
   */
  maxBodyLength?: number;
  /**
   * Optional custom filters to participate in the log decision.
   * They are applied after the built-in filters.
   */
  filters?: LogFilter[];
  /**
   * Optional logger interface. Defaults to `console`.
   */
  logger?: Logger;
}

export interface ResolvedLogFilterOptions {
  logSlowResponsesThreshold: number;
  logNonSuccesses: boolean;
  maxBodyLength: number;
  filters: LogFilter[];
  logger: Logger;
}
