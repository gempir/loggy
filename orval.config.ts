import { defineConfig } from 'orval'

export default defineConfig({
  ivrLogs: {
    input: 'https://logs.ivr.fi/openapi.json',
    output: {
      mode: 'tags-split',
      target: './src/api/endpoints',
      schemas: './src/api/model',
      client: 'react-query',
      httpClient: 'fetch',
      baseUrl: 'https://logs.ivr.fi',
      override: {
        query: {
          useQuery: true,
          version: 5,
        },
        mutator: {
          path: './src/api/fetcher.ts',
          name: 'customFetch',
        },
      },
    },
  },
  seventv: {
    input: 'https://7tv.io/v3/docs',
    output: {
      mode: 'tags-split',
      target: './src/api/endpoints',
      schemas: './src/api/model',
      client: 'react-query',
      httpClient: 'fetch',
      baseUrl: 'https://7tv.io',
      override: {
        query: {
          useQuery: true,
          version: 5,
        },
        mutator: {
          path: './src/api/fetcher.ts',
          name: 'customFetch',
        },
      },
    },
  },
})
