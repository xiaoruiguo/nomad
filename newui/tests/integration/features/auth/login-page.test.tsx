import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '@/features/auth/pages/login-page'
import { useAuthStore } from '@/stores/auth-store'

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    )
  }
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      token: null,
      tokenExpiry: null,
      selfToken: null,
      policies: [],
      oidcAuthMethod: null,
      isLoading: false,
      error: null,
      setToken: vi.fn(),
      clearToken: vi.fn(),
      fetchSelfToken: vi.fn(),
      fetchPolicies: vi.fn(),
      loginWithOIDC: vi.fn(),
      completeOIDCAuth: vi.fn(),
      monitorExpiry: vi.fn(() => () => {}),
    })
  })

  it('renders login form', () => {
    render(<LoginPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Nomad')).toBeInTheDocument()
    expect(screen.getByLabelText('Token')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('allows token input', async () => {
    render(<LoginPage />, { wrapper: createWrapper() })

    const input = screen.getByLabelText('Token')
    await userEvent.type(input, 'test-token-123')
    expect(input).toHaveValue('test-token-123')
  })

  it('does not show OIDC button when no auth methods', () => {
    render(<LoginPage />, { wrapper: createWrapper() })

    expect(screen.queryByRole('button', { name: /OIDC/i })).not.toBeInTheDocument()
  })

  it('displays error message', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      token: null,
      tokenExpiry: null,
      selfToken: null,
      policies: [],
      oidcAuthMethod: null,
      isLoading: false,
      error: 'Invalid token',
      setToken: vi.fn(),
      clearToken: vi.fn(),
      fetchSelfToken: vi.fn(),
      fetchPolicies: vi.fn(),
      loginWithOIDC: vi.fn(),
      completeOIDCAuth: vi.fn(),
      monitorExpiry: vi.fn(() => () => {}),
    })

    render(<LoginPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Invalid token')).toBeInTheDocument()
  })
})
