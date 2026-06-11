import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface ExecOpenButtonProps {
  allocationId: string
  taskName: string
  className?: string
}

export function ExecOpenButton({ allocationId, taskName, className }: ExecOpenButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/allocations/${allocationId}/exec?task=${encodeURIComponent(taskName)}`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900',
        className
      )}
      title={`Open terminal for ${taskName}`}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Terminal
    </button>
  )
}
