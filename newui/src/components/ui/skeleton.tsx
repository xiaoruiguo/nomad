import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, width, height, variant = 'text' }: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-neutral-200 dark:bg-neutral-700',
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}
