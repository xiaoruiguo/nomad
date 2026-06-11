import { cn } from '@/lib/utils'
import { Switch } from './form'
import { SearchInput } from './search-input'

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'search' | 'toggle'
  options?: { value: string; label: string }[]
  value: string | boolean
  onChange: (value: string | boolean) => void
}

export interface FilterBarProps {
  filters: FilterConfig[]
  className?: string
}

export function FilterBar({ filters, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {filters.map((filter) => {
        switch (filter.type) {
          case 'search':
            return (
              <div key={filter.key} className="min-w-[200px] flex-1 max-w-xs">
                <SearchInput
                  value={filter.value as string}
                  onChange={(v) => filter.onChange(v)}
                  placeholder={filter.label}
                />
              </div>
            )
          case 'select':
            return (
              <div key={filter.key} className="min-w-[140px]">
                <select
                  value={filter.value as string}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="">{filter.label}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          case 'toggle':
            return (
              <div key={filter.key}>
                <Switch
                  label={filter.label}
                  checked={filter.value as boolean}
                  onChange={(v) => filter.onChange(v)}
                />
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
