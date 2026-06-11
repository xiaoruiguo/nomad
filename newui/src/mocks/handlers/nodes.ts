import { http, HttpResponse, delay } from 'msw'
import { createNode, createFullNode } from '../factories/node'
import { createAllocation } from '../factories/allocation'

const nodesStore = new Map<string, ReturnType<typeof createFullNode>>()
let globalIndex = 300

function seedNodes(): void {
  if (nodesStore.size > 0) return
  for (let i = 1; i <= 5; i++) {
    const node = createFullNode({
      ID: `node-${i}`,
      Name: `nomad-${i}`,
      Address: `10.0.0.${i}`,
    })
    nodesStore.set(node.ID, node)
  }
}

async function handleBlockingQuery(request: Request, index: number): Promise<void> {
  const url = new URL(request.url)
  const queryIndex = url.searchParams.get('index')
  if (queryIndex && Number(queryIndex) >= index) {
    await delay(5000)
  }
}

seedNodes()

export const nodeHandlers = [
  http.get('/v1/nodes', async ({ request }) => {
    await handleBlockingQuery(request, globalIndex)
    const nodes = Array.from(nodesStore.values()).map((n) =>
      createNode({
        ID: n.ID,
        Name: n.Name,
        Address: n.Address,
        Datacenter: n.Datacenter,
        NodePool: n.NodePool,
        Status: n.Status,
        NodeResources: n.NodeResources,
      })
    )
    return HttpResponse.json(nodes, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.get('/v1/node/:id', async ({ request, params }) => {
    await handleBlockingQuery(request, globalIndex)
    const { id } = params
    const node = nodesStore.get(id as string)
    if (!node) {
      return HttpResponse.json({ error: 'node not found' }, { status: 404 })
    }
    return HttpResponse.json(node, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.get('/v1/node/:id/allocations', async ({ request, params }) => {
    await handleBlockingQuery(request, globalIndex)
    const { id } = params
    const node = nodesStore.get(id as string)
    if (!node) {
      return HttpResponse.json([], {
        headers: { 'X-Nomad-Index': String(globalIndex) },
      })
    }
    const allocs = [
      createAllocation({
        NodeID: node.ID,
        NodeName: node.Name,
        JobID: 'example',
      }),
    ]
    return HttpResponse.json(allocs, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.post('/v1/node/:id/drain', async ({ params, request }) => {
    const { id } = params
    const node = nodesStore.get(id as string)
    if (!node) {
      return HttpResponse.json({ error: 'node not found' }, { status: 404 })
    }
    const body = await request.json() as { DrainSpec?: { Deadline?: number; IgnoreSystemJobs?: boolean }; MarkEligible?: boolean }
    node.Drain = !body?.MarkEligible
    if (body?.DrainSpec) {
      node.LastDrain = {
        Config: {
          Deadline: body.DrainSpec.Deadline ?? 0,
          IgnoreSystemJobs: body.DrainSpec.IgnoreSystemJobs ?? false,
        },
        StartedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
      }
    }
    return HttpResponse.json(null, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),
]
