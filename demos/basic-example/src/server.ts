import Fastify from 'fastify';
import { fastifyFileRouter } from 'fastify-file-router';
import { fastifySmartLogging } from 'fastify-smart-logging';

async function main() {
  const app = Fastify();

  await app.register(fastifySmartLogging, {
    logSlowResponsesThreshold: 0,
    logNonSuccesses: true,
  });

  await app.register(fastifyFileRouter, {
    buildRoot: new URL('.', import.meta.url).pathname,
    routesDirs: ['./src/routes'],
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port });
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
}

void main();
