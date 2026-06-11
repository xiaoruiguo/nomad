import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export interface MenuItem {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  separator?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: MenuItem[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Dropdown({ trigger, items, align = 'end', side = 'bottom' }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          side={side}
          sideOffset={4}
          className={cn(
            'z-50 min-w-[180px] rounded-lg border border-neutral-200 bg-white p-1 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'dark:border-neutral-800 dark:bg-neutral-900'
          )}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.separator && i > 0 && (
                <DropdownMenu.Separator className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />
              )}
              <DropdownMenu.Item
                disabled={item.disabled}
                onSelect={item.onClick}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors',
                  item.danger
                    ? 'text-danger-600 focus:bg-danger-50 dark:text-danger-400 dark:focus:bg-danger-900/30'
                    : 'text-neutral-700 focus:bg-neutral-100 dark:text-neutral-300 dark:focus:bg-neutral-800',
                  item.disabled && 'pointer-events-none opacity-50'
                )}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                {item.label}
              </DropdownMenu.Item>
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
