export class NomadWebSocket {
  private ws: WebSocket | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private _onOpen: (() => void) | null = null
  private _onMessage: ((data: string) => void) | null = null
  private _onError: ((err: string) => void) | null = null
  private _onClose: (() => void) | null = null

  set onOpen(cb: (() => void) | null) { this._onOpen = cb }
  set onMessage(cb: ((data: string) => void) | null) { this._onMessage = cb }
  set onError(cb: ((err: string) => void) | null) { this._onError = cb }
  set onClose(cb: (() => void) | null) { this._onClose = cb }

  connect(url: string, authToken: string): void {
    this.disconnect()

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const wsUrl = url.startsWith('ws') ? url : `${protocol}//${host}${url}`

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      this.sendHandshake(authToken)
      this.startHeartbeat()
      this._onOpen?.()
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string)

        if (msg.stdout?.data) {
          const decoded = atob(msg.stdout.data)
          this._onMessage?.(decoded)
          return
        }

        if (msg.stderr?.data) {
          const decoded = atob(msg.stderr.data)
          this._onMessage?.(decoded)
          return
        }

        if (msg.driver_task_exit_event) {
          this._onMessage?.(`\r\n[Process exited with code ${msg.driver_task_exit_event.ExitCode}]\r\n`)
          return
        }

        this._onMessage?.(event.data as string)
      } catch {
        this._onMessage?.(event.data as string)
      }
    }

    this.ws.onerror = () => {
      this._onError?.('WebSocket error')
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      this._onClose?.()
    }
  }

  private sendHandshake(authToken: string): void {
    this.sendRaw({
      version: 1,
      auth_token: authToken,
    })
  }

  sendStdin(data: string): void {
    this.sendRaw({
      stdin: { data: btoa(data) },
    })
  }

  sendTtySize(w: number, h: number): void {
    this.sendRaw({
      tty_size: { width: w, height: h },
    })
  }

  private sendRaw(obj: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj))
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.sendRaw({})
    }, 10000)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  disconnect(): void {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onerror = null
      this.ws.onclose = null
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close()
      }
      this.ws = null
    }
  }
}
