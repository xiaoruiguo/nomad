import { http, HttpResponse } from 'msw'
import type { ACLToken, ACLTokenListStub, ACLPolicy } from '@/api/types/acl'

const VALID_TOKEN = 'test-management-token'

const selfToken: ACLToken = {
  ID: '',
  AccessorID: 'accessor-123',
  Name: 'Management Token',
  Type: 'management',
  Policies: [],
  Roles: [],
  SecretID: VALID_TOKEN,
  Global: true,
  CreateTime: Date.now() * 1000000,
  ModifyTime: Date.now() * 1000000,
  ExpirationTime: '',
  Description: 'Mock management token',
  Hash: '',
  CreateIndex: 1,
  ModifyIndex: 1,
}

const tokens: ACLTokenListStub[] = [
  {
    ID: '',
    AccessorID: 'accessor-123',
    Name: 'Management Token',
    Type: 'management',
    Policies: [],
    Roles: [],
    Global: true,
    CreateTime: Date.now() * 1000000,
    ExpirationTime: '',
    CreateIndex: 1,
    ModifyIndex: 1,
  },
  {
    ID: '',
    AccessorID: 'accessor-456',
    Name: 'Read-Only Token',
    Type: 'client',
    Policies: ['readonly'],
    Roles: [],
    Global: false,
    CreateTime: Date.now() * 1000000,
    ExpirationTime: '',
    CreateIndex: 2,
    ModifyIndex: 2,
  },
]

const policies: ACLPolicy[] = [
  {
    Name: 'readonly',
    Description: 'Read-only access to all namespaces',
    Rules: 'namespace "*" { policy = "read" }',
    CreateIndex: 1,
    ModifyIndex: 1,
    Hash: '',
  },
  {
    Name: 'management',
    Description: 'Full management access',
    Rules: 'namespace "*" { policy = "write" }',
    CreateIndex: 1,
    ModifyIndex: 1,
    Hash: '',
  },
]

export const aclHandlers = [
  http.get('/v1/acl/tokens', ({ request }) => {
    const authHeader = request.headers.get('X-Nomad-Token')
    if (!authHeader) {
      return HttpResponse.json({ error: 'missing token' }, { status: 403 })
    }
    return HttpResponse.json(tokens, {
      headers: { 'X-Nomad-Index': '10' },
    })
  }),

  http.get('/v1/acl/token/self', ({ request }) => {
    const authHeader = request.headers.get('X-Nomad-Token')
    if (!authHeader || authHeader !== VALID_TOKEN) {
      return HttpResponse.json({ error: 'invalid token' }, { status: 403 })
    }
    return HttpResponse.json(selfToken, {
      headers: { 'X-Nomad-Index': '10' },
    })
  }),

  http.post('/v1/acl/login', async ({ request }) => {
    const body = await request.json() as { AuthMethodName?: string; Token?: ACLToken }
    if (!body?.AuthMethodName) {
      return HttpResponse.json({ error: 'missing auth method' }, { status: 400 })
    }
    return HttpResponse.json(selfToken, {
      headers: { 'X-Nomad-Index': '11' },
    })
  }),

  http.get('/v1/acl/policies', ({ request }) => {
    const authHeader = request.headers.get('X-Nomad-Token')
    if (!authHeader) {
      return HttpResponse.json({ error: 'missing token' }, { status: 403 })
    }
    return HttpResponse.json(policies, {
      headers: { 'X-Nomad-Index': '10' },
    })
  }),
]
