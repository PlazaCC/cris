import type { ContactMessage } from '@/interfaces'

export const CONTACT_FILTERS = {
  all: { label: 'Todas', match: () => true },
  unread: { label: 'Não lidas', match: (message) => !message.read },
  // E-mail não entregue: falhou ou ficou preso no meio do envio
  failed: {
    label: 'E-mail com falha',
    match: (message) =>
      message.emailStatus === 'failed' || message.emailStatus === 'pending',
  },
} satisfies Record<
  string,
  { label: string; match: (message: ContactMessage) => boolean }
>

export type ContactFilter = keyof typeof CONTACT_FILTERS

export function countContactMessages(messages: ContactMessage[]) {
  return {
    all: messages.length,
    unread: messages.filter(CONTACT_FILTERS.unread.match).length,
    failed: messages.filter(CONTACT_FILTERS.failed.match).length,
  } satisfies Record<ContactFilter, number>
}
