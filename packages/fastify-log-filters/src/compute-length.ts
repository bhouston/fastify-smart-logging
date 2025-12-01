import type { FastifyReply } from 'fastify';

export function computePayloadLength(payload: unknown, reply: FastifyReply): number | undefined {
  const contentLengthHeader = reply.getHeader('content-length');
  if (typeof contentLengthHeader === 'string') return Number(contentLengthHeader);
  if (typeof contentLengthHeader === 'number') return contentLengthHeader;
  if (payload && typeof payload === 'string') return Buffer.byteLength(payload);
  return;
}
