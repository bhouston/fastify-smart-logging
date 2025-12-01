import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { registerFastifyLogFilter } from './hooks.js';
import type { LogFilterOptions } from './types.js';

export { registerFastifyLogFilter } from './hooks.js';
export type {
  LogAction,
  LogContext,
  LogFilter,
  LogPhase,
  LogVisibility,
  ResolvedLogFilterOptions,
  Logger,
  LogFilterOptions,
} from './types.js';

export const fastifyLogFilter = fp(
  async (app: FastifyInstance, options: LogFilterOptions = {}) => {
    registerFastifyLogFilter(app, options);
  },
  {
    name: 'fastify-log-filter',
  },
);