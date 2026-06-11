import { http, HttpResponse } from 'msw'
import { createDeployment } from '../factories/deployment'

const deploymentsStore = new Map<string, ReturnType<typeof createDeployment>>()

function seedDeployments(): void {
  if (deploymentsStore.size > 0) return
  const ids = ['deploy-1', 'deploy-2', 'deploy-3']
  for (const id of ids) {
    deploymentsStore.set(id, createDeployment({ ID: id, JobID: 'web-api' }))
  }
}

seedDeployments()

export const deploymentHandlers = [
  http.get('/v1/deployments', () => {
    const deployments = Array.from(deploymentsStore.values())
    return HttpResponse.json(deployments, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.get('/v1/deployment/:id', ({ params }) => {
    const { id } = params
    const deployment = deploymentsStore.get(id as string)
    if (!deployment) {
      return HttpResponse.json({ error: 'deployment not found' }, { status: 404 })
    }
    return HttpResponse.json(deployment, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),
]
