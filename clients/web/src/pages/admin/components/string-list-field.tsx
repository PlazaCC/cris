import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { move } from '@/lib/array'

import { ListControls } from './list-controls'

type StringListFieldProps = {
  value: string[]
  onChange: (value: string[]) => void
  itemLabel: string
  addLabel: string
  multiline?: boolean
  placeholder?: string
}

export function StringListField({
  value,
  onChange,
  itemLabel,
  addLabel,
  multiline = false,
  placeholder,
}: StringListFieldProps) {
  const update = (index: number, text: string) =>
    onChange(value.map((item, i) => (i === index ? text : item)))

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, index) => (
        <div className="flex items-start gap-2" key={index}>
          {multiline ? (
            <Textarea
              aria-label={`${itemLabel} ${index + 1}`}
              className="min-h-24 font-mono text-xs"
              placeholder={placeholder}
              value={item}
              onChange={(event) => update(index, event.target.value)}
            />
          ) : (
            <Input
              aria-label={`${itemLabel} ${index + 1}`}
              placeholder={placeholder}
              value={item}
              onChange={(event) => update(index, event.target.value)}
            />
          )}
          <ListControls
            index={index}
            length={value.length}
            label={`${itemLabel} ${index + 1}`}
            onMove={(to) => onChange(move(value, index, to))}
            onRemove={() => onChange(value.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, ''])}
      >
        <Plus />
        {addLabel}
      </Button>
    </div>
  )
}
