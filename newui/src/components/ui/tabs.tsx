import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
  count?: number
}

export interface TabsProps {
  tabs: TabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ tabs, defaultValue, value, onValueChange, children, className }: TabsProps) {
  return (
    <RadixTabs.Root
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn('flex flex-col', className)}
    >
      <RadixTabs.List className="flex border-b border-neutral-200 dark:border-neutral-800">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
              'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
              'data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2',
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent after:transition-colors',
              'data-[state=active]:after:bg-primary-500'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.count != null && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-100 px-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                {tab.count}
              </span>
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  )
}

export function TabContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return (
    <RadixTabs.Content value={value} className={cn('flex-1 focus-visible:outline-none', className)}>
      {children}
    </RadixTabs.Content>
  )
}
