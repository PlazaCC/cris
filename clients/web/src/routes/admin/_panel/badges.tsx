import { createFileRoute } from '@tanstack/react-router'

import { badgesQueryOptions } from '@/features/badges/hooks/use-badges'
import { AdminBadgesPage } from '@/pages/admin/badges'

export const Route = createFileRoute('/admin/_panel/badges')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(badgesQueryOptions()),
  component: AdminBadgesPage,
})
