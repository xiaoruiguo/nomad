import { http, HttpResponse } from 'msw'
import { createEvaluation } from '../factories/evaluation'

const evaluationsStore = new Map<string, ReturnType<typeof createEvaluation>>()

function seedEvaluations(): void {
  if (evaluationsStore.size > 0) return
  const ids = ['eval-1', 'eval-2', 'eval-3']
  for (const id of ids) {
    evaluationsStore.set(id, createEvaluation({ ID: id, JobID: 'web-api' }))
  }
}

seedEvaluations()

export const evaluationHandlers = [
  http.get('/v1/evaluations', () => {
    const evaluations = Array.from(evaluationsStore.values())
    return HttpResponse.json(evaluations, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),

  http.get('/v1/evaluation/:id', ({ params }) => {
    const { id } = params
    const evaluation = evaluationsStore.get(id as string)
    if (!evaluation) {
      return HttpResponse.json({ error: 'evaluation not found' }, { status: 404 })
    }
    return HttpResponse.json(evaluation, {
      headers: { 'X-Nomad-Index': '100' },
    })
  }),
]
