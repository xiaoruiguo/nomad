import { cn } from '@/lib/utils'

export interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  icon?: React.ReactNode
  className?: string
}

const variantStyles = {
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  success: 'border-success-200 bg-success-50 text-success-800 dark:border-success-800 dark:bg-success-900/20 dark:text-success-300',
  warning: 'border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
  danger: 'border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-300',
}

const variantIconColor = {
  info: 'text-blue-500 dark:text-blue-400',
  success: 'text-success-500 dark:text-success-400',
  warning: 'text-warning-500 dark:text-warning-400',
  danger: 'text-danger-500 dark:text-danger-400',
}

const defaultIcons: Record<string, React.ReactNode> = {
  info: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  danger: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export function Alert({ variant, title, children, onDismiss, icon, className }: AlertProps) {
  return (
    <div className={cn('rounded-lg border p-4', variantStyles[variant], className)}>
      <div className="flex gap-3">
        <div className={cn('flex-shrink-0', variantIconColor[variant])}>
          {icon ?? defaultIcons[variant]}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-sm font-semibold">{title}</h3>
          )}
          <div className={cn('text-sm', title && 'mt-1')}>{children}</div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
