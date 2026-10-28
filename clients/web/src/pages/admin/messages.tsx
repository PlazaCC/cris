import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  Mail,
  MailOpen,
  RefreshCw,
  Reply,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  CONTACT_FILTERS,
  type ContactFilter,
  countContactMessages,
} from '@/features/contact/filters'
import { useContactMessages } from '@/features/contact/hooks/use-contact-messages'
import {
  useDeleteContactMessage,
  useResendContactMessage,
  useSetContactRead,
} from '@/features/contact/hooks/use-contact-mutations'
import type { ContactEmailStatus, ContactMessage } from '@/interfaces'
import { errorMessage } from '@/lib/error-message'
import { cn } from '@/lib/utils'

import { PageHeader } from './components/field'
import { QueryState } from './components/query-state'

const STATUS: Record<ContactEmailStatus, { label: string; className: string }> =
  {
    sent: {
      label: 'E-mail enviado',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    failed: {
      label: 'E-mail falhou',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    pending: {
      label: 'E-mail não confirmado',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    disabled: {
      label: 'Envio desligado',
      className: 'bg-muted text-muted-foreground',
    },
  }

const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function AdminMessagesPage() {
  const query = useContactMessages()

  return (
    <>
      <PageHeader
        title="Mensagens"
        description="Tudo o que chega pelo “get in touch”. A mensagem fica salva aqui mesmo quando o e-mail de aviso falha."
      />
      <QueryState query={query}>
        {(messages) => <MessageList messages={messages} />}
      </QueryState>
    </>
  )
}

function MessageList({ messages }: { messages: ContactMessage[] }) {
  const [filter, setFilter] = useState<ContactFilter>('all')
  const counts = countContactMessages(messages)
  const visible = messages.filter(CONTACT_FILTERS[filter].match)

  return (
    <div className="flex flex-col gap-4">
      {counts.failed > 0 && (
        <div
          role="status"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertTriangle className="size-4 shrink-0" />
          <span>
            {counts.failed === 1
              ? '1 mensagem não chegou por e-mail.'
              : `${counts.failed} mensagens não chegaram por e-mail.`}{' '}
            Confira as{' '}
            <Link to="/admin/email" className="font-medium underline">
              configurações de e-mail
            </Link>{' '}
            e reenvie.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro">
        {(Object.keys(CONTACT_FILTERS) as ContactFilter[]).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? 'default' : 'outline'}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {CONTACT_FILTERS[key].label}
            <span className="tabular-nums opacity-70">{counts[key]}</span>
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="bg-card text-muted-foreground rounded-xl border p-10 text-center text-sm">
          {messages.length === 0
            ? 'Nenhuma mensagem ainda.'
            : 'Nenhuma mensagem neste filtro.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </ul>
      )}
    </div>
  )
}

function MessageCard({ message }: { message: ContactMessage }) {
  const setRead = useSetContactRead()
  const resend = useResendContactMessage()
  const deleteMessage = useDeleteContactMessage()
  const status = STATUS[message.emailStatus]

  return (
    <li
      className={cn(
        'bg-card flex flex-col gap-3 rounded-xl border p-4 md:p-5',
        !message.read && 'border-l-primary border-l-4'
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className={cn('truncate', !message.read && 'font-semibold')}>
            {message.name}
          </span>
          <a
            href={`mailto:${message.email}`}
            className="text-muted-foreground truncate text-sm hover:underline"
          >
            {message.email}
          </a>
        </div>
        <div className="flex flex-col items-end gap-1">
          <time
            className="text-muted-foreground text-xs"
            dateTime={message.createdAt}
          >
            {dateFormat.format(new Date(message.createdAt))}
          </time>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-xs font-medium',
              status.className
            )}
            title={message.emailError ?? undefined}
          >
            {status.label}
          </span>
        </div>
      </header>

      <p className="text-sm break-words whitespace-pre-wrap">
        {message.message}
      </p>

      {message.emailStatus === 'failed' && message.emailError && (
        <p className="rounded-md bg-red-50 p-2 font-mono text-xs break-words text-red-800">
          {message.emailError}
          {message.emailAttempts > 1 &&
            ` (${message.emailAttempts} tentativas)`}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <Button variant="outline" size="sm" asChild>
          <a
            href={`mailto:${message.email}?subject=${encodeURIComponent('Re: sua mensagem')}`}
          >
            <Reply />
            Responder
          </a>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={setRead.isPending}
          onClick={() =>
            setRead.mutate(
              { id: message.id, read: !message.read },
              { onError: (error) => toast.error(errorMessage(error)) }
            )
          }
        >
          {message.read ? <Mail /> : <MailOpen />}
          {message.read ? 'Marcar como não lida' : 'Marcar como lida'}
        </Button>
        {message.emailStatus !== 'sent' && (
          <Button
            variant="ghost"
            size="sm"
            disabled={resend.isPending}
            onClick={() =>
              resend.mutate(message.id, {
                onSuccess: (updated) => {
                  if (updated.emailStatus === 'sent') {
                    toast.success('E-mail enviado')
                  } else if (updated.emailStatus === 'disabled') {
                    toast.info('O envio de e-mail está desligado')
                  } else {
                    toast.error('O e-mail falhou de novo')
                  }
                },
                onError: (error) => toast.error(errorMessage(error)),
              })
            }
          >
            <RefreshCw className={cn(resend.isPending && 'animate-spin')} />
            {resend.isPending ? 'Enviando...' : 'Reenviar e-mail'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive ml-auto"
          disabled={deleteMessage.isPending}
          onClick={() => {
            if (!window.confirm(`Apagar a mensagem de ${message.name}?`)) return
            deleteMessage.mutate(message.id, {
              onSuccess: () => toast.success('Mensagem apagada'),
              onError: (error) => toast.error(errorMessage(error)),
            })
          }}
        >
          <Trash2 />
          Apagar
        </Button>
      </div>
    </li>
  )
}
