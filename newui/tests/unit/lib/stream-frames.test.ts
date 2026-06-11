import { describe, it, expect } from 'vitest'
import { decodeFrames } from '@/lib/stream-frames'

describe('decodeFrames', () => {
  it('decodes a single JSON object', () => {
    const input = JSON.stringify({ Offset: 0, Data: btoa('hello') })
    const { decoded, remaining } = decodeFrames(input)

    expect(decoded).toHaveLength(1)
    expect(decoded[0]!.Offset).toBe(0)
    expect(decoded[0]!.Data).toBe('hello')
    expect(remaining).toBe('')
  })

  it('decodes multiple concatenated JSON objects', () => {
    const frame1 = JSON.stringify({ Offset: 0, Data: btoa('first') })
    const frame2 = JSON.stringify({ Offset: 5, Data: btoa('second') })
    const input = frame1 + frame2
    const { decoded, remaining } = decodeFrames(input)

    expect(decoded).toHaveLength(2)
    expect(decoded[0]!.Data).toBe('first')
    expect(decoded[1]!.Data).toBe('second')
    expect(remaining).toBe('')
  })

  it('returns remaining buffer for partial input', () => {
    const frame = JSON.stringify({ Offset: 0, Data: btoa('hello') })
    const input = frame + '{"Offset":1,"Data":"inco'
    const { decoded, remaining } = decodeFrames(input)

    expect(decoded).toHaveLength(1)
    expect(decoded[0]!.Data).toBe('hello')
    expect(remaining).toBe('{"Offset":1,"Data":"inco')
  })

  it('returns empty results for empty input', () => {
    const { decoded, remaining } = decodeFrames('')

    expect(decoded).toHaveLength(0)
    expect(remaining).toBe('')
  })

  it('base64 decodes Data field', () => {
    const originalData = 'Hello, World!'
    const encodedData = btoa(originalData)
    const input = JSON.stringify({ Offset: 0, Data: encodedData })
    const { decoded } = decodeFrames(input)

    expect(decoded).toHaveLength(1)
    expect(decoded[0]!.Data).toBe(originalData)
  })

  it('skips malformed JSON', () => {
    const input = '{invalid json}{"Offset":0,"Data":"' + btoa('valid') + '"}'
    const { decoded } = decodeFrames(input)

    expect(decoded).toHaveLength(1)
    expect(decoded[0]!.Data).toBe('valid')
  })

  it('uses Data as-is if not valid base64', () => {
    const input = JSON.stringify({ Offset: 0, Data: 'not-base64!!!' })
    const { decoded } = decodeFrames(input)

    expect(decoded).toHaveLength(1)
    expect(decoded[0]!.Data).toBe('not-base64!!!')
  })
})
