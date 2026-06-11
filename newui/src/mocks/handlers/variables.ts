import { http, HttpResponse } from 'msw'
import type { Variable, VariableItem, VariableListStub } from '@/api/types/variable'

const variablesStore = new Map<string, Variable>()

function seedVariables(): void {
  if (variablesStore.size > 0) return
  const defaults = [
      { path: 'secret/db-creds', items: { username: { Key: 'username', Value: 'admin', Path: 'secret/db-creds' }, password: { Key: 'password', Value: 's3cret', Path: 'secret/db-creds' } } as Record<string, VariableItem> },
      { path: 'config/app', items: { port: { Key: 'port', Value: '8080', Path: 'config/app' }, host: { Key: 'host', Value: '0.0.0.0', Path: 'config/app' } } as Record<string, VariableItem> },
    ]
  for (const v of defaults) {
    variablesStore.set(v.path, {
      Namespace: 'default',
      Path: v.path,
      Items: v.items,
      CreateTime: Date.now() * 1000000,
      ModifyTime: Date.now() * 1000000,
      ModifyIndex: 1,
      Lock: { TTL: '', MaxLockDelay: '', LockHeld: false, LockHeldBy: '', Version: 0 },
    })
  }
}

seedVariables()

export const variableHandlers = [
  http.get('/v1/vars', () => {
    const vars: VariableListStub[] = Array.from(variablesStore.values()).map((v) => ({
      Namespace: v.Namespace,
      Path: v.Path,
      CreateTime: v.CreateTime,
      ModifyTime: v.ModifyTime,
      ModifyIndex: v.ModifyIndex,
    }))
    return HttpResponse.json(vars, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.get('/v1/var/:path', ({ params }) => {
    const { path } = params
    const variable = variablesStore.get(path as string)
    if (!variable) {
      return HttpResponse.json({ error: 'variable not found' }, { status: 404 })
    }
    return HttpResponse.json(variable, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.put('/v1/var/:path', async ({ params, request }) => {
    const { path } = params
    const body = (await request.json()) as Partial<Variable>
    const variable: Variable = {
      Namespace: body?.Namespace ?? 'default',
      Path: path as string,
      Items: body?.Items ?? {},
      CreateTime: body?.CreateTime ?? Date.now() * 1000000,
      ModifyTime: Date.now() * 1000000,
      ModifyIndex: 101,
      Lock: { TTL: '', MaxLockDelay: '', LockHeld: false, LockHeldBy: '', Version: 0 },
    }
    variablesStore.set(path as string, variable)
    return HttpResponse.json(variable, {
      headers: { 'X-Nomad-Index': '101' },
    })
  }),

  http.delete('/v1/var/:path', ({ params }) => {
    const { path } = params
    const deleted = variablesStore.delete(path as string)
    if (!deleted) {
      return HttpResponse.json({ error: 'variable not found' }, { status: 404 })
    }
    return HttpResponse.json(null, {
      headers: { 'X-Nomad-Index': '102' },
    })
  }),
]
