import { http, HttpResponse, delay } from 'msw'
import { createAllocation, createFullAllocation } from '../factories/allocation'

const allocsStore = new Map<string, ReturnType<typeof createFullAllocation>>()
let globalIndex = 200

function seedAllocs(): void {
  if (allocsStore.size > 0) return
  const jobIds = ['web-api', 'cache-redis', 'worker-batch']
  for (const jobId of jobIds) {
    for (let i = 0; i < 3; i++) {
      const alloc = createFullAllocation({
        JobID: jobId,
        Name: `${jobId}.web[${i}]`,
        ClientStatus: i === 0 ? 'running' : i === 1 ? 'running' : 'pending',
      })
      allocsStore.set(alloc.ID, alloc)
    }
  }
}

async function handleBlockingQuery(request: Request, index: number): Promise<void> {
  const url = new URL(request.url)
  const queryIndex = url.searchParams.get('index')
  if (queryIndex && Number(queryIndex) >= index) {
    await delay(5000)
  }
}

seedAllocs()

export const allocationHandlers = [
  http.get('/v1/allocations', async ({ request }) => {
    await handleBlockingQuery(request, globalIndex)
    const allocs = Array.from(allocsStore.values()).map((a) =>
      createAllocation({
        ID: a.ID,
        EvalID: a.EvalID,
        Name: a.Name,
        Namespace: a.Namespace,
        NodeID: a.NodeID,
        NodeName: a.NodeName,
        JobID: a.JobID,
        JobType: a.JobType,
        JobVersion: a.JobVersion,
        TaskGroup: a.TaskGroup,
        ClientStatus: a.ClientStatus,
        DesiredStatus: a.DesiredStatus,
      })
    )
    return HttpResponse.json(allocs, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.get('/v1/allocation/:id', async ({ request, params }) => {
    await handleBlockingQuery(request, globalIndex)
    const { id } = params
    const alloc = allocsStore.get(id as string)
    if (!alloc) {
      return HttpResponse.json({ error: 'allocation not found' }, { status: 404 })
    }
    return HttpResponse.json(alloc, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.post('/v1/allocation/:id/stop', async ({ params }) => {
    const { id } = params
    const alloc = allocsStore.get(id as string)
    if (!alloc) {
      return HttpResponse.json({ error: 'allocation not found' }, { status: 404 })
    }
    alloc.DesiredStatus = 'stop'
    return HttpResponse.json(null, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.post('/v1/client/allocation/:id/restart', async ({ params }) => {
    const { id } = params
    const alloc = allocsStore.get(id as string)
    if (!alloc) {
      return HttpResponse.json({ error: 'allocation not found' }, { status: 404 })
    }
    return HttpResponse.json(null, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),
]
