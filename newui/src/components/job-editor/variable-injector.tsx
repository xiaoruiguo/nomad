import { useState } from 'react'
import { cn } from '@/lib/utils'

interface VariableInjectorProps {
  variables: Record<string, string>
  onChange: (variables: Record<string, string>) => void
  className?: string
}

export function VariableInjector({ variables, onChange, className }: VariableInjectorProps) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const entries = Object.entries(variables)

  const handleAdd = () => {
    if (!newKey.trim()) return
    onChange({ ...variables, [newKey.trim()]: newValue })
    setNewKey('')
    setNewValue('')
  }

  const handleRemove = (key: string) => {
    const next = { ...variables }
    delete next[key]
    onChange(next)
  }

  const handleUpdate = (key: string, value: string) => {
    onChange({ ...variables, [key]: value })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-sm font-medium text-gray-700">Variables</h4>

      {entries.length > 0 && (
        <div className="space-y-1.5">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-36 shrink-0 truncate rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-mono text-gray-700">
                {key}
              </span>
              <input
                type="text"
                value={value}
                onChange={(e) => handleUpdate(key, e.target.value)}
                className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-xs font-mono text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => handleRemove(key)}
                className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-36 shrink-0 rounded-md border border-gray-200 px-2 py-1.5 text-xs font-mono placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-xs font-mono placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newKey.trim()}
          className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  )
}
