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
- `maxBodyLength?: number` – Maximum number of characters from the response body to include for error responses.
- `filters?: LogFilters[]` – Optional custom filters, applied after the built-in filters. Each filter is a function `(ctx: LogContext) => Partial<LogAction> | null | undefined` that can override the visibility, color, or tag of a log line for a given request/response/error.
- `logger?: Logger` – Optional logger interface (`{ info(message: string): void; error(message: string): void }`). Defaults to `console`.

## Custom filters

```ts
import type { LogFilters } from 'fastify-log-filters';

const tagSlowAdminRequests: LogFilters = (ctx) => {
  if (ctx.url.startsWith('/admin') && (ctx.durationMs ?? 0) > 500) {
    return { visibility: 'show', color: 'yellow', tag: 'slow-admin' };
  }
  return null;
};

await app.register(fastifyLogFilters, {
  filters: [tagSlowAdminRequests],
});
```
