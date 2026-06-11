import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './button'

interface ErrorBoundaryProps {
  fallback?: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-danger-200 bg-danger-50 p-6 dark:border-danger-800 dark:bg-danger-900/20">
          <div className="text-center">
            <svg
              className="mx-auto h-10 w-10 text-danger-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="mt-3 text-sm font-semibold text-danger-700 dark:text-danger-400">
              Something went wrong
            </h3>
            <p className="mt-1 text-xs text-danger-600 dark:text-danger-500">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={this.handleRetry}
              className="mt-4"
            >
              Try again
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
