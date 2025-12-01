import fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { fastifyLogFilters } from './index.js';
import type { Logger, LogFiltersOptions } from './types.js';

function createCollectingLogger() {
  const infoMessages: string[] = [];
  const errorMessages: string[] = [];

  const logger: Logger = {
    info(message: string) {
      infoMessages.push(message);
    },
    error(message: string) {
      errorMessages.push(message);
    },
  };

  return { logger, infoMessages, errorMessages };
}

async function createApp(options: LogFiltersOptions) {
  const app = fastify();
  const { logger, infoMessages, errorMessages } = createCollectingLogger();

  await app.register(fastifyLogFilters, {
    ...options,
    logger,
  });

  app.get('/ok', async () => ({ ok: true }));

  app.get('/error', async () => {
    throw new Error('boom');
  });

  return { app, infoMessages, errorMessages };
}

describe('fastifySmartLogging integration', () => {
  it('hides fast 2xx responses when a slow threshold is configured', async () => {
    const { app, infoMessages } = await createApp({
      logSlowResponsesThreshold: 1000,
      logNonSuccesses: true,
    });

    await app.inject({ method: 'GET', url: '/ok' });

    // Nothing should be logged for a fast 2xx response.
    expect(infoMessages.length).toBe(0);

    await app.close();
  });

  it('logs error responses even when fast', async () => {
    const { app, infoMessages, errorMessages } = await createApp({
      logSlowResponsesThreshold: 1000,
      logNonSuccesses: true,
    });

    const response = await app.inject({ method: 'GET', url: '/error' });
    expect(response.statusCode).toBeGreaterThanOrEqual(400);

    // Expect at least one log message overall (request line or error line).
    expect(infoMessages.length + errorMessages.length).toBeGreaterThanOrEqual(1);

    await app.close();
  });
});
