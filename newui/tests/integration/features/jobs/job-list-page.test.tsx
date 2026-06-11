import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { JobListPage } from '@/features/jobs/pages/job-list-page'
import { useJobList } from '@/api/hooks'

vi.mock('@/api/hooks', () => ({
  useJobList: vi.fn(),
}))

vi.mock('@/stores/system-store', () => ({
  useSystemStore: vi.fn(() => ({
    namespaces: [{ Name: 'default' }],
    activeNamespace: 'default',
  })),
}))

vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: vi.fn((selector) => {
    const state = { liveUpdateJobsIndex: false, setLiveUpdateJobsIndex: vi.fn() }
    return selector(state)
  }),
}))

const mockJobs = [
  {
    ID: 'web-api',
    Name: 'web-api',
    Namespace: 'default',
    Type: 'service',
    Status: 'running',
    Priority: 50,
    Stop: false,
    ParentID: '',
    Datacenters: ['dc1'],
    NodePool: 'default',
    Periodic: false,
    ParameterizedJob: false,
    StatusDescription: '',
    JobSummary: { JobID: 'web-api', Namespace: 'default', Summary: {} },
    CreateIndex: 1,
    ModifyIndex: 1,
    JobModifyIndex: 1,
    SubmitTime: Date.now() * 1000000,
    Meta: {},
  },
  {
    ID: 'cache-redis',
    Name: 'cache-redis',
    Namespace: 'default',
    Type: 'service',
    Status: 'running',
    Priority: 50,
    Stop: false,
    ParentID: '',
    Datacenters: ['dc1'],
    NodePool: 'default',
    Periodic: false,
    ParameterizedJob: false,
    StatusDescription: '',
    JobSummary: { JobID: 'cache-redis', Namespace: 'default', Summary: {} },
    CreateIndex: 1,
    ModifyIndex: 1,
    JobModifyIndex: 1,
    SubmitTime: Date.now() * 1000000,
    Meta: {},
  },
]

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('JobListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders job list', async () => {
    vi.mocked(useJobList).mockReturnValue({
      data: mockJobs,
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useJobList>)

    renderWithProviders(<JobListPage />)

    await waitFor(() => {
      expect(screen.getByText('web-api')).toBeInTheDocument()
      expect(screen.getByText('cache-redis')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    vi.mocked(useJobList).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useJobList>)

    renderWithProviders(<JobListPage />)

    expect(screen.getByText('Jobs')).toBeInTheDocument()
  })

  it('shows error state', () => {
    vi.mocked(useJobList).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as unknown as ReturnType<typeof useJobList>)

    renderWithProviders(<JobListPage />)

    expect(screen.getByText(/Failed to load jobs/)).toBeInTheDocument()
  })

  it('shows empty state when no jobs and no filters', async () => {
    vi.mocked(useJobList).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useJobList>)

    renderWithProviders(<JobListPage />)

    await waitFor(() => {
      expect(screen.getByText('No jobs found')).toBeInTheDocument()
    })
  })
})
