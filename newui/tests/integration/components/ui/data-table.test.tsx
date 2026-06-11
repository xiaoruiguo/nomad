import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type Column } from '@/components/ui/data-table'

interface TestRow {
  ID: string
  Name: string
  Status: string
}

const columns: Column<TestRow>[] = [
  { key: 'ID', header: 'ID', sortable: true },
  { key: 'Name', header: 'Name', sortable: true },
  { key: 'Status', header: 'Status' },
]

const data: TestRow[] = [
  { ID: '1', Name: 'web-api', Status: 'running' },
  { ID: '2', Name: 'cache-redis', Status: 'running' },
  { ID: '3', Name: 'worker-batch', Status: 'pending' },
]

describe('DataTable', () => {
  it('renders columns and data', () => {
    render(<DataTable data={data} columns={columns} />)

    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('web-api')).toBeInTheDocument()
    expect(screen.getByText('cache-redis')).toBeInTheDocument()
    expect(screen.getByText('worker-batch')).toBeInTheDocument()
  })

  it('sorts sortable columns on click', async () => {
    render(<DataTable data={data} columns={columns} />)

    const nameHeader = screen.getByText('Name')
    await userEvent.click(nameHeader)

    const rows = screen.getAllByRole('row')
    expect(rows[1]!.textContent).toContain('cache-redis')
  })

  it('calls onRowClick when row is clicked', async () => {
    const onRowClick = vi.fn()
    render(<DataTable data={data} columns={columns} onRowClick={onRowClick} />)

    await userEvent.click(screen.getByText('web-api'))
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ ID: '1' }))
  })

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    const { container } = render(<DataTable data={[]} columns={columns} loading={true} />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
