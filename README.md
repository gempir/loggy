# Loggy - Twitch Chat Logs Browser

Browse and search Twitch chat logs using the IVR Logs API.

## Getting Started

To run this application:

```bash
bun install
bun run dev
```

## Deployment

### Cloudflare Pages (SPA Mode)

This project is configured as a Single Page Application (SPA) for deployment to Cloudflare Pages. Benefits include:
- **Simpler deployment** - Just static files served from a CDN
- **Cheaper hosting** - No server-side rendering costs
- **Easy to maintain** - No SSR complexity

#### GitHub Integration (Recommended)

Connect your repository to Cloudflare Pages:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Configure build settings:
   - **Build command**: `bun run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (default)
   - **Environment variables**: Add `NODE_VERSION=20` (or use Bun)

Cloudflare will automatically deploy on every push to your main branch.

#### How it Works

The application is built in [SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode), which means:
- The initial HTML shell is prerendered at `/_shell.html`
- All routing happens client-side after the JavaScript loads
- The build output is purely static files (no server functions needed)
- Perfect for CDN deployment

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
