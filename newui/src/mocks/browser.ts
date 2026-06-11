import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export async function startWorker(): Promise<void> {
  const { worker: mswWorker } = await import('./browser')
  await mswWorker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
  })
}
