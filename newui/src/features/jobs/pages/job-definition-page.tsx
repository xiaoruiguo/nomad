import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function JobDefinitionPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Definition: {jobId}</h1>
        <Button variant="ghost" onClick={() => navigate(`/jobs/${jobId}`)}>Back to Job</Button>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Job specification and definition.</p>
    </div>
  )
}
