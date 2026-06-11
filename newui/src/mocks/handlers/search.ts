import { http, HttpResponse } from 'msw'
import type { SearchResponse } from '@/api/resources/search'

export const searchHandlers = [
  http.post('/v1/search', async ({ request }) => {
    const body = (await request.json()) as { Prefix?: string; Context?: string[] }
    const prefix = body?.Prefix ?? ''
    const response: SearchResponse = {
      Matches: {
        jobs: prefix
          ? [{ ID: `${prefix}-job-1`, Scope: 'jobs', Context: 'jobs', Matches: [{ ID: `${prefix}-job-1`, Score: 1, Context: 'jobs' }] }]
          : [],
        nodes: prefix
          ? [{ ID: `${prefix}-node-1`, Scope: 'nodes', Context: 'nodes', Matches: [{ ID: `${prefix}-node-1`, Score: 1, Context: 'nodes' }] }]
          : [],
      },
      Truncations: { jobs: false, nodes: false },
    }
    return HttpResponse.json(response, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.post('/v1/search/fuzzy', async ({ request }) => {
    const body = (await request.json()) as { Text?: string; Context?: string[] }
    const text = body?.Text ?? ''
    const response: SearchResponse = {
      Matches: {
        jobs: text
          ? [{ ID: 'web-api', Scope: 'jobs', Context: 'jobs', Matches: [{ ID: 'web-api', Score: 0.9, Context: 'jobs' }] }]
          : [],
      },
      Truncations: { jobs: false },
    }
    return HttpResponse.json(response, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),
]
