# Loggy - Twitch Chat Logs Browser

Browse and search Twitch chat logs using the IVR Logs API.

## Getting Started

To run this application:

```bash
bun install
bun run dev
```

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
