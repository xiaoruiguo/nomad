import { cn } from '@/lib/utils'

export interface StatusDotProps {
  status: 'running' | 'pending' | 'failed' | 'lost' | 'complete' | 'unknown'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

const statusColorMap = {
  running: 'bg-success-500',
  pending: 'bg-warning-500',
  failed: 'bg-danger-500',
  lost: 'bg-danger-500',
  complete: 'bg-blue-500',
  unknown: 'bg-neutral-400',
}

const sizeMap = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
}

const labelSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
}

export function StatusDot({ status, size = 'md', label, className }: StatusDotProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex">
        <span
          className={cn(
            'inline-block rounded-full',
            sizeMap[size],
            statusColorMap[status],
            status === 'running' && 'animate-pulse'
          )}
        />
        {status === 'running' && (
          <span
            className={cn(
              'absolute inline-block h-full w-full animate-ping rounded-full opacity-75',
              statusColorMap[status]
            )}
          />
        )}
      </span>
      {label && (
        <span className={cn('font-medium text-neutral-700 dark:text-neutral-300', labelSizeMap[size])}>
          {label}
        </span>
      )}
    </span>
  )
}
