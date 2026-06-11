import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'

interface KVPair {
  key: string
  value: string
  encrypted: boolean
}

interface VariableFormProps {
  items: KVPair[]
  onChange: (items: KVPair[]) => void
  errors?: Record<string, string>
}

export function VariableForm({ items, onChange, errors }: VariableFormProps) {
  const addRow = () => {
    onChange([...items, { key: '', value: '', encrypted: false }])
  }

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateRow = (index: number, field: keyof KVPair, value: string | boolean) => {
    const updated = [...items]
    updated[index] = { ...updated[index]!, [field]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Items</p>
        <Button variant="ghost" size="sm" onClick={addRow}>
          + Add Item
        </Button>
      </div>

      {items.length === 0 && (
        <p className="py-4 text-center text-sm text-neutral-500">No items yet. Click "Add Item" to add key-value pairs.</p>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              placeholder="Key"
              value={item.key}
              onChange={(e) => updateRow(index, 'key', e.target.value)}
              error={errors?.[`${index}.key`]}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Value"
              value={item.value}
              onChange={(e) => updateRow(index, 'value', e.target.value)}
              type={item.encrypted ? 'password' : 'text'}
              error={errors?.[`${index}.value`]}
            />
          </div>
          <label className="flex items-center gap-1.5 pt-2">
            <input
              type="checkbox"
              checked={item.encrypted}
              onChange={(e) => updateRow(index, 'encrypted', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-xs text-neutral-500">Encrypt</span>
          </label>
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="mt-2 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-danger-500 dark:hover:bg-neutral-800"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export type { KVPair }
