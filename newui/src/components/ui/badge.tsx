import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
        success: 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400',
        warning: 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
        danger: 'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
        info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
