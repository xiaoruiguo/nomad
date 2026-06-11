import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NomadClient, setAuthToken, getAuthToken } from '@/api/client'
import type { NomadError } from '@/api/types/common'

describe('NomadClient', () => {
  let client: NomadClient

  beforeEach(() => {
    client = new NomadClient('http://localhost:4646')
    setAuthToken(null)
  })

  describe('buildURL', () => {
    it('builds URL with path', () => {
      const url = (client as unknown as { buildURL: (path: string, params?: Record<string, string>) => string }).buildURL('/v1/jobs')
      expect(url).toBe('http://localhost:4646/v1/jobs')
    })

    it('builds URL with query params', () => {
      const url = (client as unknown as { buildURL: (path: string, params?: Record<string, string>) => string }).buildURL('/v1/jobs', { namespace: 'default', region: 'global' })
      expect(url).toContain('namespace=default')
      expect(url).toContain('region=global')
    })

    it('omits empty params', () => {
      const url = (client as unknown as { buildURL: (path: string, params?: Record<string, string>) => string }).buildURL('/v1/jobs', { namespace: '', region: 'global' })
      expect(url).not.toContain('namespace=')
      expect(url).toContain('region=global')
    })
  })

  describe('get', () => {
    it('extracts X-Nomad-Index header', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'X-Nomad-Index': '42' },
        })
      )

      const result = await client.get<unknown[]>('/v1/jobs')
      expect(result.index).toBe(42)
      fetchSpy.mockRestore()
    })

    it('extracts X-Nomad-NextToken header', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'X-Nomad-Index': '10', 'X-Nomad-NextToken': 'abc123' },
        })
      )

      const result = await client.get<unknown[]>('/v1/jobs')
      expect(result.nextToken).toBe('abc123')
      fetchSpy.mockRestore()
    })
  })

  describe('post', () => {
    it('sends body as JSON', async () => {
      const body = { Name: 'test-job' }
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ ID: 'test-job' }), {
          status: 200,
          headers: { 'X-Nomad-Index': '5' },
        })
      )

      await client.post('/v1/jobs', body)

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
      fetchSpy.mockRestore()
    })
  })

  describe('error handling', () => {
    it('throws NomadError on non-OK response', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ error: 'job not found' }), {
          status: 404,
          statusText: 'Not Found',
        })
      )

      await expect(client.get('/v1/job/nonexistent')).rejects.toMatchObject({
        statusCode: 404,
        message: 'job not found',
      })

      fetchSpy.mockRestore()
    })

    it('handles non-JSON error responses', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('Internal Server Error', {
          status: 500,
          statusText: 'Internal Server Error',
        })
      )

      await expect(client.get('/v1/jobs')).rejects.toMatchObject({
        statusCode: 500,
        message: 'Internal Server Error',
      })

      fetchSpy.mockRestore()
    })
  })

  describe('auth header', () => {
    it('includes X-Nomad-Token when set', async () => {
      setAuthToken('my-secret-token')

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'X-Nomad-Index': '1' },
        })
      )

      await client.get('/v1/jobs')

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Nomad-Token': 'my-secret-token',
          }),
        })
      )
      fetchSpy.mockRestore()
    })

    it('does not include X-Nomad-Token when not set', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'X-Nomad-Index': '1' },
        })
      )

      await client.get('/v1/jobs')

      const callArgs = fetchSpy.mock.calls[0]!
      const headers = callArgs[1]!.headers as Record<string, string>
      expect(headers['X-Nomad-Token']).toBeUndefined()
      fetchSpy.mockRestore()
    })
  })
})
