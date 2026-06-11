export interface Frame {
  Offset: number
  Data: string
}

export function decodeFrames(buffer: string): { decoded: Frame[]; remaining: string } {
  const decoded: Frame[] = []
  let remaining = buffer

  while (remaining.length > 0) {
    let objStr = ''

    if (remaining.startsWith('{')) {
      let depth = 0
      let inString = false
      let escape = false
      let endIdx = -1

      for (let i = 0; i < remaining.length; i++) {
        const ch = remaining[i]

        if (escape) {
          escape = false
          continue
        }

        if (ch === '\\' && inString) {
          escape = true
          continue
        }

        if (ch === '"') {
          inString = !inString
          continue
        }

        if (inString) continue

        if (ch === '{') depth++
        if (ch === '}') {
          depth--
          if (depth === 0) {
            endIdx = i
            break
          }
        }
      }

      if (endIdx === -1) break

      objStr = remaining.substring(0, endIdx + 1)
      remaining = remaining.substring(endIdx + 1)
    } else {
      const nextBrace = remaining.indexOf('{')
      if (nextBrace === -1) break
      remaining = remaining.substring(nextBrace)
      continue
    }

    try {
      const frame = JSON.parse(objStr) as Frame
      if (frame.Offset !== undefined && frame.Data !== undefined) {
        let data = frame.Data
        try {
          data = atob(frame.Data)
        } catch {
          // Data is not base64, use as-is
        }
        decoded.push({ Offset: frame.Offset, Data: data })
      }
    } catch {
      // skip malformed JSON
    }
  }

  return { decoded, remaining }
}
