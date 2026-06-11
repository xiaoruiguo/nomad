import { useState, useCallback, useRef } from 'react'

interface PaginationState<T> {
  items: T[]
  nextToken: string | null
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  reset: () => void
}

export function usePagination<T>(
  fetcher: (nextToken?: string) => Promise<{ data: T[]; nextToken?: string }>
): PaginationState<T> {
  const [items, setItems] = useState<T[]>([])
  const [nextToken, setNextToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcherRef.current(nextToken ?? undefined)
      setItems((prev) => [...prev, ...result.data])
      setNextToken(result.nextToken ?? null)
      setHasMore(!!result.nextToken && result.data.length > 0)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [nextToken, isLoading, hasMore])

  const reset = useCallback(() => {
    setItems([])
    setNextToken(null)
    setIsLoading(false)
    setError(null)
    setHasMore(true)
  }, [])

  return { items, nextToken, isLoading, error, hasMore, loadMore, reset }
}
