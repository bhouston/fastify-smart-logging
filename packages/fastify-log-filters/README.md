# fastify-log-filters

A Fastify plugin for conditional, filtered request/response logging: hide boring fast 2xxs, highlight slow and failed requests.

## Installation

```bash
pnpm add fastify-log-filters
```

## Usage

```ts
import Fastify from 'fastify';
import { fastifyLogFilters } from 'fastify-log-filters';

const app = Fastify();

await app.register(fastifyLogFilters, {
  // Log all requests and errors
  logSlowResponsesThreshold: 0,
  // Also log non-2xx responses
  logNonSuccesses: true,
});
```

## Options

- `logSlowResponsesThreshold?: number` – If set to `0` (default), all requests are logged as they begin. If set to a positive number (in milliseconds), any request that runs longer than this threshold will be logged, as well as any non-success responses when `logNonSuccesses` is `true`.
- `logNonSuccesses?: boolean` – When `true` (default), 4xx and 5xx responses are logged along with their response bodies (truncated for very large payloads).

