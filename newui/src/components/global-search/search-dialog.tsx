import { useState, useEffect, useRef, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { fuzzySearch, type SearchResponse } from '@/api/resources/search'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CONTEXT_LABELS: Record<string, string> = {
  jobs: 'Jobs',
  nodes: 'Clients',
  allocs: 'Allocations',
  groups: 'Task Groups',
  csi_plugins: 'CSI Plugins',
  volumes: 'Volumes',
  namespaces: 'Namespaces',
}

const CONTEXT_ROUTES: Record<string, (id: string) => string> = {
  jobs: (id) => `/jobs/${id}`,
  nodes: (id) => `/clients/${id}`,
  allocs: (id) => `/allocations/${id}`,
  groups: (id) => `/jobs/${id}`,
  csi_plugins: (id) => `/csi/plugins/${id}`,
  volumes: (id) => `/csi/volumes/${id}`,
  namespaces: (id) => `/namespaces/${id}`,
}

interface FlatResult {
  id: string
  context: string
  score: number
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nomad_recent_searches') ?? '[]')
    } catch {
      return []
    }
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flatResults: FlatResult[] = []
  if (results?.Matches) {
    for (const [context, items] of Object.entries(results.Matches)) {
      for (const item of items) {
        for (const match of item.Matches) {
          flatResults.push({
            id: match.ID,
            context,
            score: match.Score,
          })
        }
      }
    }
    flatResults.sort((a, b) => b.score - a.score)
  }

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const doSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const { data } = await fuzzySearch(text, ['jobs', 'nodes', 'allocs', 'groups', 'csi_plugins', 'volumes', 'namespaces'])
      setResults(data)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      doSearch(query)
    }, 300)
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, doSearch])

  const handleSelect = (id: string, context: string) => {
    const route = CONTEXT_ROUTES[context]
    if (route) {
      navigate(route(id))
    }
    setRecentSearches((prev) => {
      const next = [query, ...prev.filter((s) => s !== query)].slice(0, 5)
      localStorage.setItem('nomad_recent_searches', JSON.stringify(next))
      return next
    })
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && flatResults.length > 0) {
      e.preventDefault()
      const selected = flatResults[selectedIndex]
      if (selected) {
        handleSelect(selected.id, selected.context)
      }
    }
  }

  const grouped = new Map<string, FlatResult[]>()
  for (const r of flatResults) {
    const existing = grouped.get(r.context) ?? []
    existing.push(r)
    grouped.set(r.context, existing)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 rounded-xl border border-gray-200 bg-white shadow-2xl focus:outline-none">
          <div className="flex items-center border-b border-gray-200 px-4">
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search jobs, clients, allocations..."
              className="flex-1 border-0 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
            {loading && (
              <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <kbd className="ml-2 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400">ESC</kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {!query && recentSearches.length > 0 && (
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-500 mb-1">Recent</p>
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="block w-full rounded px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {query && flatResults.length === 0 && !loading && (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}

            {Array.from(grouped.entries()).map(([context, items]) => (
              <div key={context} className="px-2 py-1">
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  {CONTEXT_LABELS[context] ?? context}
                </p>
                {items.slice(0, 5).map((item) => {
                  const globalIndex = flatResults.indexOf(item)
                  return (
                    <button
                      key={`${item.context}-${item.id}`}
                      type="button"
                      onClick={() => handleSelect(item.id, item.context)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100',
                        globalIndex === selectedIndex && 'bg-blue-50'
                      )}
                    >
                      <span className="truncate text-gray-800">{item.id}</span>
                      <span className="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        {CONTEXT_LABELS[context] ?? context}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
