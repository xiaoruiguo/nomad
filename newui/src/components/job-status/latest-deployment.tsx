import { useState } from 'react'
import type { Deployment } from '@/api/types'
import { promoteDeployment, pauseDeployment, failDeployment } from '@/api/resources/deployments'
import { cn } from '@/lib/utils'
import { truncateMiddle } from '@/lib/utils'

interface LatestDeploymentProps {
  deployment: Deployment
}

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-blue-100 text-blue-800 border-blue-200',
  successful: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export function LatestDeployment({ deployment }: LatestDeploymentProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePromote = async () => {
    setLoading('promote')
    try {
      await promoteDeployment(deployment.ID, { DeployID: deployment.ID, Groups: [] })
    } finally {
      setLoading(null)
    }
  }

  const handlePause = async () => {
    setLoading('pause')
    try {
      await pauseDeployment(deployment.ID, { DeployID: deployment.ID, Pause: deployment.Status?.toLowerCase() !== 'paused' })
    } finally {
      setLoading(null)
    }
  }

  const handleFail = async () => {
    setLoading('fail')
    try {
      await failDeployment(deployment.ID)
    } finally {
      setLoading(null)
    }
  }

  const isPaused = deployment.Status?.toLowerCase() === 'paused'
  const isRunning = deployment.Status?.toLowerCase() === 'running'

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Latest Deployment</h4>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 text-xs font-medium',
            STATUS_COLORS[deployment.Status?.toLowerCase()] ?? 'bg-gray-100 text-gray-800 border-gray-200'
          )}
        >
          {deployment.Status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">ID</span>
          <p className="font-mono text-xs">{truncateMiddle(deployment.ID, 16)}</p>
        </div>
        <div>
          <span className="text-gray-500">Version</span>
          <p className="font-mono text-xs">v{deployment.JobVersion}</p>
        </div>
        {deployment.StatusDescription && (
          <div className="col-span-2">
            <span className="text-gray-500">Description</span>
            <p className="text-xs">{deployment.StatusDescription}</p>
          </div>
        )}
      </div>

      {deployment.RequiresExplicitPromotion && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Requires explicit promotion to proceed
        </div>
      )}

      <div className="flex items-center gap-2">
        {isRunning && (
          <button
            type="button"
            onClick={handlePromote}
            disabled={loading !== null}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading === 'promote' ? 'Promoting...' : 'Promote'}
          </button>
        )}
        {(isRunning || isPaused) && (
          <button
            type="button"
            onClick={handlePause}
            disabled={loading !== null}
            className="rounded bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading === 'pause' ? '...' : isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        {(isRunning || isPaused) && (
          <button
            type="button"
            onClick={handleFail}
            disabled={loading !== null}
            className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading === 'fail' ? 'Failing...' : 'Fail'}
          </button>
        )}
      </div>
    </div>
  )
}
