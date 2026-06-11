import { useState } from 'react'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut'
import { SearchDialog } from './search-dialog'
import { cn } from '@/lib/utils'

interface SearchTriggerProps {
  className?: string
}

export function SearchTrigger({ className }: SearchTriggerProps) {
  const [open, setOpen] = useState(false)

  useKeyboardShortcut('/', () => {
    setOpen(true)
  })

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700',
          className
        )}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search...</span>
        <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400">/</kbd>
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
