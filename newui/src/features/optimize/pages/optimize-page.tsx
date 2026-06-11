import { useScalingPolicies } from '@/api/hooks'
import { PageLayout } from '@/components/layout/page-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { ScalingPolicyListStub } from '@/api/resources/scaling'

interface Recommendation {
  id: string
  jobId: string
  taskGroup: string
  policy: ScalingPolicyListStub
  currentCount: number
  recommendedCount: number
  min: number
  max: number
}

export function OptimizePage() {
  const { data, isLoading, error } = useScalingPolicies()

  const policies = (data?.data ?? []) as ScalingPolicyListStub[]

  const recommendations: Recommendation[] = policies
    .filter((p) => p.Target?.Job && p.Target?.Group)
    .map((p) => ({
      id: p.ID,
      jobId: p.Target?.Job ?? '',
      taskGroup: p.Target?.Group ?? '',
      policy: p,
      currentCount: 0,
      recommendedCount: Math.max(p.Min, Math.min(p.Max, Math.ceil((p.Min + p.Max) / 2))),
      min: p.Min,
      max: p.Max,
    }))

  if (error) {
    return (
      <PageLayout title="Optimize">
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
          Failed to load scaling policies: {error.message}
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Optimize" subtitle="Scaling policies and resource recommendations">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          title="No scaling policies found"
          description="No scaling policies have been configured. Add scaling policies to your jobs to see recommendations here."
        />
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {rec.jobId}
                    </h3>
                    <Badge variant="neutral" size="sm">{rec.taskGroup}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Policy ID: <span className="font-mono">{rec.id.slice(0, 8)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">Dismiss</Button>
                  <Button variant="primary" size="sm">Apply</Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-md border border-neutral-100 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div className="text-xs text-neutral-500">Min</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-700 dark:text-neutral-300">{rec.min}</div>
                </div>
                <div className="rounded-md border border-primary-100 bg-primary-50 p-3 text-center dark:border-primary-900 dark:bg-primary-900/20">
                  <div className="text-xs text-primary-600 dark:text-primary-400">Recommended</div>
                  <div className="mt-1 text-lg font-semibold text-primary-700 dark:text-primary-300">{rec.recommendedCount}</div>
                </div>
                <div className="rounded-md border border-neutral-100 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800/50">
                  <div className="text-xs text-neutral-500">Max</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-700 dark:text-neutral-300">{rec.max}</div>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{
                    width: `${rec.max > 0 ? (rec.recommendedCount / rec.max) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
