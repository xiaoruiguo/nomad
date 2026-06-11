import { cn } from '@/lib/utils'
import { Breadcrumbs } from './breadcrumbs'

export interface PageLayoutProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function PageLayout({ title, subtitle, actions, breadcrumbs, children, className }: PageLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          {breadcrumbs ?? <Breadcrumbs />}
          <h1 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  )
}
