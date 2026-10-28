import { ImageIcon, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ResponsiveImage } from '@/interfaces'

import { MediaLibrary, UploadButton } from './media-library'

type ImageFieldProps = {
  label: string
  value: string
  onChange: (url: string) => void
}

// Uma URL de imagem escolhida da biblioteca (ou enviada na hora)
export function ImageField({ label, value, onChange }: ImageFieldProps) {
  const [open, setOpen] = useState(false)

  const choose = (url: string) => {
    onChange(url)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="bg-muted relative flex aspect-[4/3] w-full max-w-64 items-center justify-center overflow-hidden rounded-lg border">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <ImageIcon className="text-muted-foreground size-8" />
        )}
        {value && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 size-7"
            aria-label={`Remover ${label}`}
            onClick={() => onChange('')}
          >
            <X />
          </Button>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setOpen(true)}
      >
        {value ? 'Trocar imagem' : 'Escolher imagem'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85dvh] flex-col sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Escolha da biblioteca ou envie uma imagem nova.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <UploadButton
              onUploaded={(items) => {
                if (items.length === 1) choose(items[0].url)
              }}
            />
          </div>
          <div className="-mx-1 overflow-y-auto px-1 pb-1">
            <MediaLibrary
              selected={value}
              onSelect={(item) => choose(item.url)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type ResponsiveImageFieldProps = {
  label: string
  value: ResponsiveImage
  onChange: (value: ResponsiveImage) => void
}

// Desktop e mobile; sem imagem mobile, o site usa a de desktop
export function ResponsiveImageField({
  label,
  value,
  onChange,
}: ResponsiveImageFieldProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ImageField
        label={`${label} (desktop)`}
        value={value.desktop}
        onChange={(desktop) => onChange({ ...value, desktop })}
      />
      <ImageField
        label={`${label} (mobile)`}
        value={value.mobile}
        onChange={(mobile) => onChange({ ...value, mobile })}
      />
    </div>
  )
}
