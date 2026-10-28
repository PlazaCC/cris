import { Check, Trash2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'

import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { Button } from '@/components/ui/button'
import { useMedia } from '@/features/media/hooks/use-media'
import {
  useDeleteMedia,
  useUploadMedia,
} from '@/features/media/hooks/use-media-mutations'
import type { MediaItem } from '@/interfaces'
import { errorMessage } from '@/lib/error-message'
import { cn } from '@/lib/utils'

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`
}

export function UploadButton({
  onUploaded,
}: {
  onUploaded?: (items: MediaItem[]) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const uploadMedia = useUploadMedia()

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = ''
          if (files.length === 0) return

          uploadMedia.mutate(files, {
            onSuccess: (items) => {
              toast.success(
                items.length > 1
                  ? `${items.length} imagens enviadas`
                  : 'Imagem enviada'
              )
              onUploaded?.(items)
            },
            onError: (error) => toast.error(errorMessage(error)),
          })
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={uploadMedia.isPending}
        onClick={() => input.current?.click()}
      >
        <Upload />
        {uploadMedia.isPending ? 'Enviando...' : 'Enviar imagens'}
      </Button>
    </>
  )
}

type MediaLibraryProps = {
  // Modo seletor: clicar escolhe a imagem; sem ele, a grade permite apagar
  selected?: string
  onSelect?: (item: MediaItem) => void
}

export function MediaLibrary({ selected, onSelect }: MediaLibraryProps) {
  const { data: items, isLoading, error, refetch } = useMedia()
  const deleteMedia = useDeleteMedia()

  if (isLoading || error || !items) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        {isLoading && <LoadingState message="Carregando imagens..." />}
        {error && (
          <ErrorState
            title="Não foi possível carregar as imagens"
            onRetry={() => {
              void refetch()
            }}
          />
        )}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground flex min-h-40 items-center justify-center text-sm">
        Nenhuma imagem ainda. Envie a primeira.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const isSelected = item.url === selected
        const name = item.pathname.split('/').pop() ?? item.pathname

        return (
          <li
            key={item.id}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-lg border',
              isSelected && 'ring-primary ring-2'
            )}
          >
            <button
              type="button"
              disabled={!onSelect}
              className="bg-muted aspect-[4/3] w-full disabled:cursor-default"
              onClick={() => onSelect?.(item)}
            >
              <img
                src={item.url}
                alt={item.alt || name}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </button>
            {isSelected && (
              <span className="bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1">
                <Check className="size-3.5" />
              </span>
            )}
            <div className="flex items-center justify-between gap-2 p-2">
              <div className="min-w-0 text-xs">
                <p className="truncate font-medium" title={name}>
                  {name}
                </p>
                <p className="text-muted-foreground">{formatSize(item.size)}</p>
              </div>
              {!onSelect && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Apagar ${name}`}
                  disabled={deleteMedia.isPending}
                  onClick={() => {
                    if (!window.confirm(`Apagar ${name}?`)) return
                    deleteMedia.mutate(item.id, {
                      onSuccess: () => toast.success('Imagem apagada'),
                      onError: (error) => toast.error(errorMessage(error)),
                    })
                  }}
                >
                  <Trash2 />
                </Button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
