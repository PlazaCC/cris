import { createFileRoute } from '@tanstack/react-router'

import { contactMessagesQueryOptions } from '@/features/contact/hooks/use-contact-messages'
import { AdminMessagesPage } from '@/pages/admin/messages'

export const Route = createFileRoute('/admin/_panel/messages')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(contactMessagesQueryOptions()),
  component: AdminMessagesPage,
})
