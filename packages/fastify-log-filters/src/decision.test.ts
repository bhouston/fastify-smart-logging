import { describe, expect, it } from 'vitest';
import { baseShouldLogFilters, errorColorFilter, evaluateFilters, slowColorFilter } from './decision.js';
import type { LogContext, ResolvedLogFiltersOptions } from './types.js';

const baseCtx: Omit<LogContext, 'phase'> = {
  method: 'GET',
  url: '/test',
  requestId: '1',
  statusCode: 200,
  durationMs: 10,
};

const resolvedDefaults: ResolvedLogFiltersOptions = {
  logSlowResponsesThreshold: 0,
  logNonSuccesses: true,
  maxBodyLength: 200,
  filters: [],
  logger: {
    info() {},
    error() {},
  },
};

describe('baseShouldLogFilters', () => {
  it('logs everything when threshold is 0', () => {
    const filter = baseShouldLogFilters(resolvedDefaults);
    const ctx: LogContext = { ...baseCtx, phase: 'response' };
    const result = filter(ctx);
    expect(result?.visibility).toBe('show');
  });

  it('hides fast 2xx responses when threshold > 0', () => {
    const filter = baseShouldLogFilters({
      ...resolvedDefaults,
      logSlowResponsesThreshold: 100,
    });
    const ctx: LogContext = { ...baseCtx, phase: 'response', durationMs: 10, statusCode: 200 };
    const result = filter(ctx);
    expect(result?.visibility).toBe('hide');
  });

  it('shows slow 2xx responses when threshold > 0', () => {
    const filter = baseShouldLogFilters({
      ...resolvedDefaults,
      logSlowResponsesThreshold: 50,
    });
    const ctx: LogContext = { ...baseCtx, phase: 'response', durationMs: 100, statusCode: 200 };
    const result = filter(ctx);
    expect(result?.visibility).toBe('show');
  });

  it('shows non-success responses when enabled', () => {
    const filter = baseShouldLogFilters({
      ...resolvedDefaults,
      logSlowResponsesThreshold: 100,
      logNonSuccesses: true,
    });
    const ctx: LogContext = { ...baseCtx, phase: 'response', statusCode: 500 };
    const result = filter(ctx);
    expect(result?.visibility).toBe('show');
  });
});

describe('color filters', () => {
  it('errorColorFilter colors 5xx red and 4xx yellow', () => {
    const filter = errorColorFilter();

    const ctx5xx: LogContext = { ...baseCtx, phase: 'response', statusCode: 500 };
    const res5xx = filter(ctx5xx);
    expect(res5xx?.color).toBe('red');

    const ctx4xx: LogContext = { ...baseCtx, phase: 'response', statusCode: 404 };
    const res4xx = filter(ctx4xx);
    expect(res4xx?.color).toBe('yellow');

    const ctx2xx: LogContext = { ...baseCtx, phase: 'response', statusCode: 200 };
    const res2xx = filter(ctx2xx);
    expect(res2xx).toBeNull();
  });

  it('slowColorFilter colors slow responses yellow when threshold > 0', () => {
    const filter = slowColorFilter({
      ...resolvedDefaults,
      logSlowResponsesThreshold: 50,
    });
    const ctx: LogContext = { ...baseCtx, phase: 'response', durationMs: 60 };
    const result = filter(ctx);
    expect(result?.color).toBe('yellow');
  });
});

describe('evaluateFilters', () => {
  it('applies filters and merges actions', () => {
    const ctx: LogContext = { ...baseCtx, phase: 'response', statusCode: 500, durationMs: 200 };
    const options: ResolvedLogFiltersOptions = {
      ...resolvedDefaults,
      logSlowResponsesThreshold: 100,
    };
    const filters = [baseShouldLogFilters(options), slowColorFilter(options), errorColorFilter()];
    const result = evaluateFilters(ctx, filters, { visibility: 'hide' });

    expect(result.visibility).toBe('show');
    expect(result.color).toBe('red');
  });
});
