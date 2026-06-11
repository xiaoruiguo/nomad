import { getAuthToken } from '@/api/client'

export class BlockingQueryClient {
  private indexes: Map<string, number>
  private abortControllers: Map<string, AbortController>

  constructor() {
    this.indexes = new Map()
    this.abortControllers = new Map()
  }

  async fetch<T>(
    key: string,
    url: string,
    params?: Record<string, string>,
    signal?: AbortSignal
  ): Promise<{ data: T; index: number }> {
    const controller = new AbortController()
    this.abortControllers.set(key, controller)

    const combinedSignal = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal

    const currentIndex = this.indexes.get(key)
    const queryParams: Record<string, string> = { ...params }

    if (currentIndex !== undefined) {
      queryParams.index = String(currentIndex)
    }
    queryParams.wait = '5s'

    const separator = url.includes('?') ? '&' : '?'
    const queryString = new URLSearchParams(queryParams).toString()
    const fullUrl = `${url}${separator}${queryString}`

    const token = getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['X-Nomad-Token'] = token
    }

    const res = await fetch(fullUrl, {
      signal: combinedSignal,
      headers,
    })

    if (!res.ok) {
      throw new Error(`Blocking query failed: ${res.status} ${res.statusText}`)
    }

    const newIndexHeader = res.headers.get('X-Nomad-Index')
    const newIndex = newIndexHeader ? Number(newIndexHeader) : currentIndex ?? 0

    if (newIndex > 0) {
      this.indexes.set(key, newIndex)
    }

    const data: T = await res.json()
    this.abortControllers.delete(key)

    return { data, index: newIndex }
  }

  cancel(key: string): void {
    const controller = this.abortControllers.get(key)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(key)
    }
    this.indexes.delete(key)
  }

  cancelAll(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort()
    }
    this.abortControllers.clear()
    this.indexes.clear()
  }

  getIndex(key: string): number | undefined {
    return this.indexes.get(key)
  }

  setIndex(key: string, index: number): void {
    this.indexes.set(key, index)
  }
}

export const blockingQueryClient = new BlockingQueryClient()
