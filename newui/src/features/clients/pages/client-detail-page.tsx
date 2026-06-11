import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function ClientDetailPage() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Client: {clientId}</h1>
        <Button variant="ghost" onClick={() => navigate('/clients')}>Back to Clients</Button>
      </div>
    </div>
  )
}
