import { http, HttpResponse, delay } from 'msw'
import { createJob, createFullJob } from '../factories/job'
import { createAllocation } from '../factories/allocation'
import { createEvaluation } from '../factories/evaluation'
import { createDeployment } from '../factories/deployment'
import type { Job, JobListStub } from '@/api/types/job'

const jobsStore = new Map<string, Job>()
let globalIndex = 100

function nextIndex(): number {
  globalIndex++
  return globalIndex
}

function seedJobs(): void {
  if (jobsStore.size > 0) return
  const names = ['web-api', 'cache-redis', 'worker-batch', 'monitor-grafana', 'proxy-nginx']
  const types = ['service', 'service', 'batch', 'service', 'service']
  const statuses = ['running', 'running', 'running', 'running', 'running']
  for (let i = 0; i < names.length; i++) {
    const job = createFullJob({
      ID: names[i]!,
      Name: names[i]!,
      Type: types[i]!,
      Status: statuses[i]!,
    })
    jobsStore.set(names[i]!, job)
  }
}

async function handleBlockingQuery(request: Request, index: number): Promise<void> {
  const url = new URL(request.url)
  const queryIndex = url.searchParams.get('index')
  if (queryIndex && Number(queryIndex) >= index) {
    await delay(5000)
  }
}

seedJobs()

export const jobHandlers = [
  http.get('/v1/jobs', async ({ request }) => {
    await handleBlockingQuery(request, globalIndex)
    const url = new URL(request.url)
    const prefix = url.searchParams.get('prefix') ?? ''
    const namespace = url.searchParams.get('namespace')

    const jobs: JobListStub[] = []
    for (const job of jobsStore.values()) {
      if (prefix && !job.Name.startsWith(prefix)) continue
      if (namespace && job.Namespace !== namespace) continue
      jobs.push(createJob({
        ID: job.ID,
        Name: job.Name,
        Namespace: job.Namespace,
        Type: job.Type,
        Status: job.Status,
        Priority: job.Priority,
        Stop: job.Stop,
        JobSummary: job.JobSummary,
        CreateIndex: job.CreateIndex,
        ModifyIndex: job.ModifyIndex,
        JobModifyIndex: job.JobModifyIndex,
        SubmitTime: job.SubmitTime,
      }))
    }

    return HttpResponse.json(jobs, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.get('/v1/job/:id', async ({ request, params }) => {
    await handleBlockingQuery(request, globalIndex)
    const { id } = params
    const job = jobsStore.get(id as string)
    if (!job) {
      return HttpResponse.json({ error: 'job not found' }, { status: 404 })
    }
    return HttpResponse.json(job, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.post('/v1/jobs', async ({ request }) => {
    const body = await request.json() as Job
    const job = createFullJob({
      ...body,
      CreateIndex: nextIndex(),
      ModifyIndex: globalIndex,
      JobModifyIndex: globalIndex,
    })
    jobsStore.set(job.ID, job)
    return HttpResponse.json(job, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.delete('/v1/job/:id', async ({ params }) => {
    const { id } = params
    const job = jobsStore.get(id as string)
    if (!job) {
      return HttpResponse.json({ error: 'job not found' }, { status: 404 })
    }
    job.Stop = true
    job.Status = 'dead'
    job.ModifyIndex = nextIndex()
    return HttpResponse.json(null, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.get('/v1/job/:id/allocations', async ({ request, params }) => {
    await handleBlockingQuery(request, globalIndex)
    const { id } = params
    const job = jobsStore.get(id as string)
    if (!job) {
      return HttpResponse.json([], {
        headers: { 'X-Nomad-Index': String(globalIndex) },
      })
    }
    const allocs = job.TaskGroups?.flatMap((tg) =>
      Array.from({ length: tg.Count }, (_, i) =>
        createAllocation({
          JobID: job.ID,
          TaskGroup: tg.Name,
          Name: `${job.ID}.${tg.Name}[${i}]`,
          ClientStatus: i === 0 ? 'running' : 'running',
        })
      )
    ) ?? []
    return HttpResponse.json(allocs, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.get('/v1/job/:id/evaluations', async ({ request, params }) => {
    await handleBlockingQuery(request, globalIndex)
    const { id } = params
    const evals = [
      createEvaluation({ JobID: id as string }),
    ]
    return HttpResponse.json(evals, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.get('/v1/job/:id/deployments', async ({ request, params }) => {
    await handleBlockingQuery(request, globalIndex)
    const { id } = params
    const deployments = [
      createDeployment({ JobID: id as string }),
    ]
    return HttpResponse.json(deployments, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.get('/v1/job/:id/summary', async ({ request, params }) => {
    await handleBlockingQuery(request, globalIndex)
    const { id } = params
    const job = jobsStore.get(id as string)
    if (!job) {
      return HttpResponse.json(null, { status: 404 })
    }
    return HttpResponse.json(job.JobSummary, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.post('/v1/jobs/parse', async () => {
    const job = createFullJob({ Name: 'parsed-job' })
    return HttpResponse.json({ Job: job, Error: '', Warnings: '' }, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),

  http.post('/v1/job/:id/plan', async ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      Annotations: [],
      FailedTGAllocs: {},
      JobDiff: { Type: 'Added', ID: id as string, Fields: [], Objects: [], TaskGroups: [] },
      NextPeriodicLaunch: 0,
      CreatedEvals: [],
      Diff: '',
      Warnings: '',
    }, {
      headers: { 'X-Nomad-Index': String(globalIndex) },
    })
  }),
]
