export class SSEClient {
  private abortController: AbortController | null = null

  async connect(
    url: string,
    headers: Record<string, string>,
    onEvent: (event: Record<string, unknown>) => void,
    onError: (err: Error) => void
  ): Promise<void> {
    this.disconnect()

    this.abortController = new AbortController()
    const { signal } = this.abortController

    try {
      const fetchHeaders: Record<string, string> = {
        ...headers,
        Accept: 'application/json',
      }

      const res = await fetch(url, {
        signal,
        headers: fetchHeaders,
      })

      if (!res.ok) {
        throw new Error(`SSE connection failed: ${res.status} ${res.statusText}`)
      }

      if (!res.body) {
        throw new Error('Response body is null')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          try {
            const event = JSON.parse(trimmed)
            onEvent(event)
          } catch {
            // skip unparseable lines
          }
        }
      }
    } catch (err) {
      if (signal.aborted) return
      onError(err as Error)
    }
  }

  disconnect(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}
