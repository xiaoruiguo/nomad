import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabContent, type TabItem } from '@/components/ui/tabs'

const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'allocations', label: 'Allocations', count: 5 },
  { value: 'evaluations', label: 'Evaluations' },
]

describe('Tabs', () => {
  it('renders all tabs', () => {
    render(
      <Tabs tabs={tabs}>
        <TabContent value="overview">Overview content</TabContent>
        <TabContent value="allocations">Allocations content</TabContent>
        <TabContent value="evaluations">Evaluations content</TabContent>
      </Tabs>
    )

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Allocations')).toBeInTheDocument()
    expect(screen.getByText('Evaluations')).toBeInTheDocument()
  })

  it('shows first tab content by default', () => {
    render(
      <Tabs tabs={tabs}>
        <TabContent value="overview">Overview content</TabContent>
        <TabContent value="allocations">Allocations content</TabContent>
      </Tabs>
    )

    expect(screen.getByText('Overview content')).toBeInTheDocument()
  })

  it('switches tab on click', async () => {
    render(
      <Tabs tabs={tabs}>
        <TabContent value="overview">Overview content</TabContent>
        <TabContent value="allocations">Allocations content</TabContent>
      </Tabs>
    )

    await userEvent.click(screen.getByText('Allocations'))
    expect(screen.getByText('Allocations content')).toBeInTheDocument()
  })

  it('shows count badge when count is provided', () => {
    render(
      <Tabs tabs={tabs}>
        <TabContent value="overview">Overview content</TabContent>
        <TabContent value="allocations">Allocations content</TabContent>
      </Tabs>
    )

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('applies active indicator to active tab', () => {
    render(
      <Tabs tabs={tabs}>
        <TabContent value="overview">Overview content</TabContent>
        <TabContent value="allocations">Allocations content</TabContent>
      </Tabs>
    )

    const activeTab = screen.getByText('Overview').closest('[data-state="active"]')
    expect(activeTab).toBeInTheDocument()
  })
})
