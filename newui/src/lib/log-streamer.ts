export class LogStreamer {
  private abortController: AbortController | null = null

  async start(
    url: string,
    params: Record<string, string>,
    onFrame: (data: string, offset: number) => void,
    onError: (err: Error) => void,
    onEnd?: () => void,
    headers?: Record<string, string>
  ): Promise<void> {
    this.stop()

    this.abortController = new AbortController()
    const { signal } = this.abortController

    const queryString = new URLSearchParams(params).toString()
    const separator = url.includes('?') ? '&' : '?'
    const fullUrl = `${url}${separator}${queryString}`

    try {
      const fetchHeaders: Record<string, string> = {
        ...(headers || {}),
      }

      const res = await fetch(fullUrl, {
        signal,
        headers: fetchHeaders,
      })

      if (!res.ok) {
        throw new Error(`Log stream failed: ${res.status} ${res.statusText}`)
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
            const frame = JSON.parse(trimmed)
            if (frame.Offset !== undefined && frame.Data !== undefined) {
              const decoded = atob(frame.Data)
              onFrame(decoded, frame.Offset)
            }
          } catch {
            onFrame(trimmed, 0)
          }
        }
      }

      onEnd?.()
    } catch (err) {
      if (signal.aborted) return
      onError(err as Error)
    }
  }

  stop(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}
