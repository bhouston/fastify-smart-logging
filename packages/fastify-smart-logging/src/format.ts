import chalk from 'chalk';
import { humanizeBytes, humanizeTime } from 'humanize-units';
import type { LogAction, LogContext } from './types.js';

export function formatStatus(statusCode: number, action: LogAction): string {
  const base = `${statusCode}`;
  const color = action.color;

  if (color === 'red') return chalk.red(base);
  if (color === 'yellow') return chalk.yellow(base);
  if (color === 'dim') return chalk.dim(base);

  if (statusCode >= 500) return chalk.red(base);
  if (statusCode >= 400) return chalk.yellow(base);

  return base;
}

export function formatBody(payload: unknown, maxBodyLength: number): string | undefined {
  if (!payload) return;

  let bodyStr: string;

  if (typeof payload === 'string') {
    bodyStr = payload;
  } else if (typeof payload === 'number' || typeof payload === 'boolean' || typeof payload === 'bigint') {
    bodyStr = String(payload);
  } else if (typeof payload === 'symbol' || typeof payload === 'function') {
    bodyStr = String(payload);
  } else if (typeof payload === 'object') {
    if (payload instanceof Error) {
      bodyStr = payload.message;
    } else if (Buffer.isBuffer(payload)) {
      bodyStr = payload.toString('utf8');
    } else {
      try {
        bodyStr = JSON.stringify(payload, null, 2);
      } catch {
        bodyStr = String(payload);
      }
    }
  } else {
    bodyStr = String(payload);
  }

  if (bodyStr.length > maxBodyLength) {
    bodyStr = `${bodyStr.substring(0, maxBodyLength)}...`;
  }

  return bodyStr;
}

export function formatResponseLine(
  ctx: LogContext,
  action: LogAction,
  payloadLength: number | undefined,
  maxBodyLength: number,
): string {
  const statusCode = ctx.statusCode ?? 0;
  const statusStr = `↳ ${formatStatus(statusCode, action)}`;

  const durationSeconds = (ctx.durationMs ?? 0) / 1000;
  const dur = humanizeTime(durationSeconds);

  const len = payloadLength ? humanizeBytes(payloadLength) : '???B';

  const bodyStr = statusCode >= 400 ? formatBody(ctx.payload, maxBodyLength) : undefined;

  const parts: string[] = [
    `[${ctx.requestId}] ${statusStr}`,
    action.tag ? `[${action.tag}]` : undefined,
    bodyStr ? chalk.dim(`${bodyStr}`) : undefined,
    len,
    `in ${dur}`,
  ].filter(Boolean) as string[];

  return parts.join(' ');
}

export function formatErrorMainLine(ctx: LogContext, action: LogAction, durationLabel: string, status: number): string {
  const statusStr = formatStatus(status, action);
  const errorMessage = ctx.error instanceof Error ? ctx.error.message : String(ctx.error);
  return `[${ctx.requestId}] × ${ctx.method} ${ctx.url} → ${statusStr} ${durationLabel} ${errorMessage}`;
}

export function formatErrorStackLine(ctx: LogContext): string | undefined {
  const err = ctx.error;
  if (err instanceof Error && err.stack) {
    return chalk.dim(`[${ctx.requestId}] Error stack: ${err.stack}`);
  }
  return;
}
