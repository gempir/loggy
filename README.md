# Loggy - Twitch Chat Logs Browser

Browse and search Twitch chat logs using the IVR Logs API.

## Getting Started

To run this application:

```bash
bun install
bun run dev
```

## Deployment

### Cloudflare Workers

The project is now configured to deploy to Cloudflare Workers. To deploy:

1. **Login to Cloudflare** (first time only):
```bash
bun dlx wrangler login
```

2. **Deploy to Cloudflare Workers**:
```bash
bun run deploy
```

3. **Preview locally** (optional):
```bash
bun run preview
```

#### Configuration

The Cloudflare Workers configuration is managed in `wrangler.jsonc`. You can customize:
- App name: Change the `"name"` field
- Compatibility date and flags as needed

For more details, see the [TanStack Start Cloudflare Workers guide](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#cloudflare-workers--official-partner).

### Cloudflare Pages

Alternatively, you can deploy to Cloudflare Pages with the following settings:

- **Build command**: `bun run build`
- **Build output directory**: `dist`
- **Node version**: Use Bun or Node.js 18+

## Development

### API Client Generation

The API client is automatically generated from the IVR Logs API:

```bash
bun run generate
```

### Code Quality

This project uses Biome for linting and formatting:

```bash
bun run lint       # Check for issues
bun run format     # Format code
bun run check      # Lint and format
```

### Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
bun run test
```
