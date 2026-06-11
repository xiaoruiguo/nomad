import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from '@/lib/query-client'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth-store'
import { setAuthToken } from '@/api/client'

export function App() {
  const [mounted, setMounted] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (token !== undefined && token !== null) {
      setAuthToken(token)
      setAuthReady(true)
    } else {
      setAuthReady(true)
    }
  }, [token])

  if (!mounted || !authReady) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
