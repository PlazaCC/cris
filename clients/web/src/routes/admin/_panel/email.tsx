import { createFileRoute } from '@tanstack/react-router'

import { mailSettingsQueryOptions } from '@/features/contact/hooks/use-mail-settings'
import { AdminEmailPage } from '@/pages/admin/email'

export const Route = createFileRoute('/admin/_panel/email')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(mailSettingsQueryOptions()),
  component: AdminEmailPage,
})
