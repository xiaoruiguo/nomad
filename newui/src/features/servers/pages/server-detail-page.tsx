import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function ServerDetailPage() {
  const { serverId } = useParams()
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Server: {serverId}</h1>
        <Button variant="ghost" onClick={() => navigate('/servers')}>Back to Servers</Button>
      </div>
    </div>
  )
}
