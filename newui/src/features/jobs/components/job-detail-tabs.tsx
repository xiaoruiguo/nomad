import { useSearchParams } from 'react-router-dom'
import { Tabs, TabContent, type TabItem } from '@/components/ui/tabs'

export const JOB_DETAIL_TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'allocations', label: 'Allocations' },
  { value: 'deployments', label: 'Deployments' },
  { value: 'evaluations', label: 'Evaluations' },
  { value: 'versions', label: 'Versions' },
  { value: 'clients', label: 'Clients' },
  { value: 'services', label: 'Services' },
  { value: 'variables', label: 'Variables' },
  { value: 'definition', label: 'Definition' },
] as const

export type JobDetailTabValue = (typeof JOB_DETAIL_TABS)[number]['value']

interface JobDetailTabsProps {
  allocCount?: number
  deploymentCount?: number
  evalCount?: number
  children: React.ReactNode
}

export function JobDetailTabs({ allocCount, deploymentCount, evalCount, children }: JobDetailTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = searchParams.get('tab') ?? 'overview'

  const tabs: TabItem[] = JOB_DETAIL_TABS.map((tab) => {
    let count: number | undefined
    if (tab.value === 'allocations') count = allocCount
    if (tab.value === 'deployments') count = deploymentCount
    if (tab.value === 'evaluations') count = evalCount

    return {
      value: tab.value,
      label: tab.label,
      count,
    }
  })

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', value)
      return next
    })
  }

  return (
    <Tabs
      tabs={tabs}
      defaultValue="overview"
      value={currentTab}
      onValueChange={handleTabChange}
    >
      {children}
    </Tabs>
  )
}

export { TabContent }
