import type { FastifyRequest } from 'fastify';
import { startTimeSymbol, type TimedFastifyRequest } from './symbols.js';

export const markRequestStart = (request: FastifyRequest): void => {
  (request as TimedFastifyRequest)[startTimeSymbol] = process.hrtime.bigint();
};

export const getRequestStart = (request: FastifyRequest): bigint | undefined =>
  (request as TimedFastifyRequest)[startTimeSymbol];

export function getDurationMs(startNs: bigint): number {
  const endNs = process.hrtime.bigint();
  const diffNs = endNs - startNs;
  return Number(diffNs) / 1_000_000; // ns -> ms
}

export function formatDurationMs(startNs: bigint): string {
  const endNs = process.hrtime.bigint();
  const diffNs = endNs - startNs;
  const ms = Number(diffNs) / 1_000_000; // ns -> ms
  const rounded = Math.round(ms * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}ms` : `${rounded.toFixed(1)}ms`;
}
