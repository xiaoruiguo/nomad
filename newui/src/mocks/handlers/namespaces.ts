import { http, HttpResponse } from 'msw'
import { createNamespace } from '../factories/namespace'
import type { Namespace } from '@/api/resources/namespaces'

const namespacesStore = new Map<string, Namespace>()

function seedNamespaces(): void {
  if (namespacesStore.size > 0) return
  const defaults = ['default', 'staging', 'production']
  for (const name of defaults) {
    namespacesStore.set(name, createNamespace({ Name: name, Description: `${name} namespace` }))
  }
}

seedNamespaces()

export const namespaceHandlers = [
  http.get('/v1/namespaces', () => {
    const namespaces = Array.from(namespacesStore.values())
    return HttpResponse.json(namespaces, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.get('/v1/namespace/:name', ({ params }) => {
    const { name } = params
    const ns = namespacesStore.get(name as string)
    if (!ns) {
      return HttpResponse.json({ error: 'namespace not found' }, { status: 404 })
    }
    return HttpResponse.json(ns, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.put('/v1/namespace/:name', async ({ params, request }) => {
    const { name } = params
    const body = (await request.json()) as Partial<Namespace>
    const ns = createNamespace({ Name: name as string, ...body })
    namespacesStore.set(name as string, ns)
    return HttpResponse.json(ns, {
      headers: { 'X-Nomad-Index': '101' },
    })
  }),

  http.delete('/v1/namespace/:name', ({ params }) => {
    const { name } = params
    const deleted = namespacesStore.delete(name as string)
    if (!deleted) {
      return HttpResponse.json({ error: 'namespace not found' }, { status: 404 })
    }
    return HttpResponse.json(null, {
      headers: { 'X-Nomad-Index': '102' },
    })
  }),
]
