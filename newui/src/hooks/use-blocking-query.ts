import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useVisibility } from './use-visibility'
import { getAuthToken } from '@/api/client'

interface BlockingQueryResult<T> {
  data: T | undefined
  index: number | undefined
  error: Error | null
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  refetch: () => void
}

export function useBlockingQuery<T>(
  queryKey: string[],
  url: string,
  options?: {
    params?: Record<string, string>
    enabled?: boolean
    throttleMs?: number
    waitTime?: string
  }
): BlockingQueryResult<T> {
  const isVisible = useVisibility()
  const queryClient = useQueryClient()
  const token = getAuthToken()

  const enabled = (options?.enabled ?? true) && isVisible && !!token
  const throttleMs = options?.throttleMs ?? 2000
  const waitTime = options?.waitTime ?? '5s'

  const result = useQuery({
    queryKey: [...queryKey, 'blocking'],
    queryFn: async ({ signal }) => {
      const currentIndexData = queryClient.getQueryData<{ index: number }>([...queryKey, 'blocking', 'meta'])
      const index = currentIndexData?.index

      const params = new URLSearchParams(options?.params)
      if (index) {
        params.set('index', String(index))
      }
      params.set('wait', waitTime)

      const separator = url.includes('?') ? '&' : '?'
      const fullUrl = `${url}${separator}${params.toString()}`

      const headers: Record<string, string> = {}
      const currentToken = getAuthToken()
      if (currentToken) {
        headers['X-Nomad-Token'] = currentToken
      }

      const res = await fetch(fullUrl, { signal, headers })
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`)
      }

      const newIndex = res.headers.get('X-Nomad-Index')
      if (newIndex) {
        queryClient.setQueryData([...queryKey, 'blocking', 'meta'], { index: Number(newIndex) })
      }

      const data: T = await res.json()
      return { data, index: newIndex ? Number(newIndex) : index }
    },
    enabled,
    refetchInterval: throttleMs,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  return {
    data: result.data?.data as T | undefined,
    index: result.data?.index,
    error: result.error,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    refetch: result.refetch,
  }
}
