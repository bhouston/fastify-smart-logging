## fastify-log-filters monorepo

[![NPM Package][npm]][npm-url]
[![Tests][tests-badge]][tests-url]
[![Coverage][coverage-badge]][coverage-url]

This repository contains the [`fastify-log-filters`](packages/fastify-log-filters) Fastify plugin — conditional, filtered request/response logging that hides boring fast 2xxs and highlights slow and failed requests — plus its demo applications.

See [packages/fastify-log-filters/README.md](packages/fastify-log-filters/README.md) for full documentation on the published package.

### Development

```bash
pnpm install
pnpm dev
pnpm tsc
pnpm build
pnpm lint # oxlint
pnpm lint:fix
pnpm format # oxfmt
pnpm test # vitest
```

## Author

[Ben Houston](https://ben3d.ca), Sponsored by [Land of Assets](https://landofassets.com)

[npm]: https://img.shields.io/npm/v/fastify-log-filters
[npm-url]: https://www.npmjs.com/package/fastify-log-filters
[tests-badge]: https://github.com/bhouston/fastify-smart-logging/actions/workflows/ci.yml/badge.svg
[tests-url]: https://github.com/bhouston/fastify-smart-logging/actions/workflows/ci.yml
[coverage-badge]: https://codecov.io/gh/bhouston/fastify-smart-logging/branch/main/graph/badge.svg
[coverage-url]: https://codecov.io/gh/bhouston/fastify-smart-logging
