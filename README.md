<p align="center">
  <a href="https://codecov.io/gh/bhouston/fastify-smart-logging"><img src="https://codecov.io/gh/bhouston/fastify-smart-logging/branch/main/graph/badge.svg" alt="coverage"></a>
  <a href="https://discord.gg/fwupDN493R"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
</p>
<br/>

# Fastify Smart Logging

> Fastify request logging that hides the boring requests and shows the problems.

- 🔇 Hides Fast Successful Requests
- 🐢 Highlights Slow Requests
- ❌ Logs Error Response Bodies
- 🧩 Custom Log Filters
- 📝 Bring Your Own Logger

This repository contains the [`fastify-log-filters`](packages/fastify-log-filters) Fastify plugin, which does conditional, filtered request and response logging: hide boring fast 2xx responses, highlight slow and failed requests. It also holds the plugin's demo application. The package is not yet published to npm.

See the [package README](packages/fastify-log-filters/README.md) for usage and options.

## Development

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

## Contribution

See [Contributing Guide](CONTRIBUTING.md).

## License

MIT

## Author

[Ben Houston](https://ben3d.ca), Sponsored by [Land of Assets](https://landofassets.com).
