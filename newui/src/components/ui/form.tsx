import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-9 w-full rounded-md border bg-white px-3 text-sm transition-colors',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-700'
              : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 dark:border-neutral-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-neutral-900 dark:text-neutral-100',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'flex h-9 w-full rounded-md border bg-white px-3 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-700'
              : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 dark:border-neutral-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-neutral-900 dark:text-neutral-100',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
            'placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-700'
              : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500/20 dark:border-neutral-700',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-neutral-900 dark:text-neutral-100',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export interface SwitchProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
  className?: string
}

export function Switch({ label, checked, onChange, description, disabled, className }: SwitchProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        {label && (
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </span>
        )}
        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-700'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}
