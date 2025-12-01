import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { registerFastifyLogFilters } from './hooks.js';
import type { LogFiltersOptions } from './types.js';

export { registerFastifyLogFilters } from './hooks.js';
export type {
  LogAction,
  LogContext,
  LogFilters,
  LogPhase,
  LogVisibility,
  ResolvedLogFiltersOptions,
  Logger,
  LogFiltersOptions,
} from './types.js';

export const fastifyLogFilters = fp(
  async (app: FastifyInstance, options: LogFiltersOptions = {}) => {
    registerFastifyLogFilters(app, options);
  },
  {
    name: 'fastify-log-filters',
  },
);