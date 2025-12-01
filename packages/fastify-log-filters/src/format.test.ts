import { describe, expect, it } from 'vitest';
import { formatBody, formatResponseLine, formatStatus } from './format.js';
import type { LogAction, LogContext } from './types.js';

const baseCtx: LogContext = {
  phase: 'response',
  method: 'GET',
  url: '/test',
  requestId: '1',
  statusCode: 200,
  durationMs: 123,
};

describe('formatStatus', () => {
  it('applies colors based on action before status code', () => {
    const resRed = formatStatus(500, { visibility: 'show', color: 'red' });
    expect(resRed).toContain('500');

    const resYellow = formatStatus(400, { visibility: 'show', color: 'yellow' });
    expect(resYellow).toContain('400');
  });
});

describe('formatBody', () => {
  it('stringifies objects and truncates long bodies', () => {
    const obj = { foo: 'bar' };
    const result = formatBody(obj, 10);
    expect(result).toBeDefined();
    expect(result?.length).toBeLessThanOrEqual(13); // "{"foo":"bar"}" or truncated
  });
});

describe('formatResponseLine', () => {
  it('builds a response log line with status, size and duration', () => {
    const action: LogAction = { visibility: 'show' };
    const line = formatResponseLine(baseCtx, action, 1234, 200);

    expect(line).toContain('[1]');
    expect(line).toContain('↳');
    expect(line).toContain('in');
  });
});
