import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function JobRunPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Run Job</h1>
        <Button variant="ghost" onClick={() => navigate('/jobs')}>Cancel</Button>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Submit a new job to the Nomad cluster.</p>
    </div>
  )
}
