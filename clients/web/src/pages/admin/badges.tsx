import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useCreateBadge,
  useDeleteBadge,
  useUpdateBadge,
} from '@/features/badges/hooks/use-badge-mutations'
import { useBadges } from '@/features/badges/hooks/use-badges'
import type { Badge } from '@/interfaces'
import { errorMessage } from '@/lib/error-message'

import { PageHeader, Section } from './components/field'
import { QueryState } from './components/query-state'

export function AdminBadgesPage() {
  const query = useBadges()

  return (
    <>
      <PageHeader
        title="Badges"
        description="Os papéis que aparecem em “Role” nos projetos."
      />
      <QueryState query={query}>
        {(badges) => (
          <Section title={`${badges.length} badges`}>
            <NewBadge />
            <ul className="divide-y rounded-lg border">
              {badges.map((badge) => (
                <BadgeRow badge={badge} key={badge.documentId} />
              ))}
            </ul>
          </Section>
        )}
      </QueryState>
    </>
  )
}

function NewBadge() {
  const [name, setName] = useState('')
  const createBadge = useCreateBadge()

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) return
        createBadge.mutate(name.trim(), {
          onSuccess: () => {
            setName('')
            toast.success('Badge criado')
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      }}
    >
      <Input
        aria-label="Nome do novo badge"
        placeholder="Novo badge (ex.: Product Design)"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <Button type="submit" disabled={createBadge.isPending || !name.trim()}>
        <Plus />
        Criar
      </Button>
    </form>
  )
}

function BadgeRow({ badge }: { badge: Badge }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(badge.name)
  const updateBadge = useUpdateBadge()
  const deleteBadge = useDeleteBadge()

  if (editing) {
    return (
      <li>
        <form
          className="flex items-center gap-2 p-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim()) return
            updateBadge.mutate(
              { id: badge.documentId, name: name.trim() },
              {
                onSuccess: () => {
                  setEditing(false)
                  toast.success('Badge renomeado')
                },
                onError: (error) => toast.error(errorMessage(error)),
              }
            )
          }}
        >
          <Input
            autoFocus
            aria-label={`Novo nome para ${badge.name}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Salvar nome"
            disabled={updateBadge.isPending}
          >
            <Check />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cancelar"
            onClick={() => {
              setName(badge.name)
              setEditing(false)
            }}
          >
            <X />
          </Button>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between gap-2 py-1 pr-2 pl-4">
      <span className="text-sm">{badge.name}</span>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Renomear ${badge.name}`}
          onClick={() => setEditing(true)}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Apagar ${badge.name}`}
          disabled={deleteBadge.isPending}
          onClick={() => {
            if (
              !window.confirm(
                `Apagar "${badge.name}"? Ele sai de todos os projetos que o usam.`
              )
            )
              return
            deleteBadge.mutate(badge.documentId, {
              onSuccess: () => toast.success('Badge apagado'),
              onError: (error) => toast.error(errorMessage(error)),
            })
          }}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  )
}
