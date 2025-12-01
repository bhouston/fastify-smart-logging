import type { FastifyRequest } from 'fastify';

export const startTimeSymbol = Symbol('startTime');
// biome-ignore lint/security/noSecrets: Symbol description only, not a secret.
export const requestLoggedSymbol = Symbol('requestLoggedFlag');
// biome-ignore lint/security/noSecrets: Symbol description only, not a secret.
export const timeoutHandleSymbol = Symbol('timeoutHandleFlag');

export type TimedFastifyRequest = FastifyRequest & {
  [startTimeSymbol]?: bigint;
  [requestLoggedSymbol]?: boolean;
  [timeoutHandleSymbol]?: NodeJS.Timeout;
};
