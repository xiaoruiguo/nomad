import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Badge variant="success">Running</Badge>)
    expect(container.querySelector('span')!.className).toContain('bg-success-50')
  })

  it('applies size classes', () => {
    const { container } = render(<Badge size="sm">Small</Badge>)
    expect(container.querySelector('span')!.className).toContain('text-xs')
  })

  it('renders with icon', () => {
    const icon = <span data-testid="badge-icon">⚡</span>
    render(<Badge icon={icon}>With Icon</Badge>)
    expect(screen.getByTestId('badge-icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })
})
