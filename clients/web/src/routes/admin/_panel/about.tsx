import { createFileRoute } from '@tanstack/react-router'

import { aboutQueryOptions } from '@/features/about/hooks/use-about'
import { AdminAboutPage } from '@/pages/admin/about'

export const Route = createFileRoute('/admin/_panel/about')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(aboutQueryOptions()),
  component: AdminAboutPage,
})
