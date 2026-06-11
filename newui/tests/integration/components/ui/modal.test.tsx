import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/ui/modal'

describe('Modal', () => {
  it('opens and renders content', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders title and description', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Confirm Action" description="Are you sure?">
        <p>Body</p>
      </Modal>
    )

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    )

    const closeButton = document.querySelector('[data-state="open"] button')
    expect(closeButton).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    )

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })
})
