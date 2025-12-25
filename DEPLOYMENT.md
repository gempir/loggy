# Deployment Guide for Cloudflare Pages

## Cloudflare Pages Configuration

This project is configured to deploy to Cloudflare Pages using Nitro with Cloudflare Pages Functions.

### Build Settings

Configure your Cloudflare Pages project with:

- **Framework preset**: None (or Vite if available)
- **Build command**: `bun run build`
- **Build output directory**: `dist`
- **Node.js version**: 18 or later (or use Bun)

### Environment Variables

If you need to set environment variables:

1. Go to your Cloudflare Pages project settings
2. Navigate to "Environment variables"
3. Add any required variables for production/preview environments

### How It Works

The build process:

1. Runs Orval to generate the API client from the OpenAPI spec
2. Builds the React app with Vite
3. Generates a Cloudflare Pages Functions worker using Nitro
4. Outputs everything to `dist/`:
   - Static assets (CSS, JS) in `dist/assets/`
   - Worker code in `dist/_worker.js/`
   - Route configuration in `dist/_routes.json`
   - Cache headers in `dist/_headers`

The `_routes.json` file tells Cloudflare Pages which routes to handle with the worker (all dynamic routes) and which to serve as static files (assets).

### Local Preview

To preview the production build locally:

```bash
bun run build
npx wrangler pages dev dist
```

This will start a local server that mimics the Cloudflare Pages environment.

### Deployment

Cloudflare Pages will automatically deploy when you push to your main branch (if connected to GitHub). Or you can use the Wrangler CLI:

```bash
bunx wrangler pages deploy dist
```

### Troubleshooting

If you encounter issues:

1. **Build fails**: Check that all dependencies are installed and `bun run build` works locally
2. **Assets 404**: Verify the `dist/` directory structure and that `_routes.json` excludes your assets
3. **Routes not working**: Check that the worker is being deployed correctly in the Cloudflare Pages dashboard

### Base Path

The app is configured to run at the root path (`/`). If you need to deploy to a subpath, update the `base` option in `vite.config.ts`.
