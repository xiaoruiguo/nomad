import { useState } from 'react'
import { useDrainNode } from '@/api/hooks'
import { Modal } from '@/components/ui/modal'
import { Input, Switch } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Node } from '@/api/types/node'

interface NodeDrainPopoverProps {
  node: Node
  onClose: () => void
}

export function NodeDrainPopover({ node, onClose }: NodeDrainPopoverProps) {
  const drainMutation = useDrainNode()
  const [deadline, setDeadline] = useState('0')
  const [ignoreSystem, setIgnoreSystem] = useState(false)

  const isCurrentlyDraining = node.Drain

  const handleSubmit = async () => {
    const deadlineNs = Math.max(0, Math.floor(parseFloat(deadline) || 0)) * 1_000_000_000
    await drainMutation.mutateAsync({
      id: node.ID,
      request: {
        NodeID: node.ID,
        DrainSpec: {
          Deadline: deadlineNs,
          IgnoreSystemJobs: ignoreSystem,
        },
        MarkEligible: !isCurrentlyDraining,
      },
    })
    onClose()
  }

  const handleStopDrain = async () => {
    await drainMutation.mutateAsync({
      id: node.ID,
      request: {
        NodeID: node.ID,
        DrainSpec: {
          Deadline: 0,
          IgnoreSystemJobs: false,
        },
        MarkEligible: true,
      },
    })
    onClose()
  }

  return (
    <Modal
      open={true}
      onOpenChange={(open) => { if (!open) onClose() }}
      title={isCurrentlyDraining ? 'Update Drain' : 'Drain Node'}
      description={`Configure drain settings for ${node.Name}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Current Status</span>
            {isCurrentlyDraining ? (
              <Badge variant="warning" size="sm">Draining</Badge>
            ) : (
              <Badge variant="success" size="sm">Not Draining</Badge>
            )}
          </div>
          {node.LastDrain && (
            <div className="mt-2 text-xs text-neutral-500">
              Last drain started: {node.LastDrain.StartedAt ? new Date(node.LastDrain.StartedAt).toLocaleString() : '—'}
            </div>
          )}
        </div>

        <Input
          label="Deadline (seconds)"
          type="number"
          min="0"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          placeholder="0 = no deadline"
        />

        <Switch
          label="Ignore System Jobs"
          description="System jobs will not be stopped during drain"
          checked={ignoreSystem}
          onChange={setIgnoreSystem}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {isCurrentlyDraining && (
            <Button
              variant="danger"
              onClick={handleStopDrain}
              loading={drainMutation.isPending}
            >
              Stop Drain
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            loading={drainMutation.isPending}
          >
            {isCurrentlyDraining ? 'Update Drain' : 'Start Drain'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
