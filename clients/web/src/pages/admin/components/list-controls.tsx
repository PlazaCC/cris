import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ListControlsProps = {
  index: number
  length: number
  label: string
  onMove: (to: number) => void
  onRemove: () => void
}

// Mover para cima/baixo e remover, usado em toda lista do painel
export function ListControls({
  index,
  length,
  label,
  onMove,
  onRemove,
}: ListControlsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Mover ${label} para cima`}
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Mover ${label} para baixo`}
        disabled={index === length - 1}
        onClick={() => onMove(index + 1)}
      >
        <ArrowDown />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remover ${label}`}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
