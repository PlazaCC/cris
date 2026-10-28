import { createFileRoute } from '@tanstack/react-router'

import { badgesQueryOptions } from '@/features/badges/hooks/use-badges'
import { AdminNewProjectPage } from '@/pages/admin/projects/editor'

export const Route = createFileRoute('/admin/_panel/projects/new')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(badgesQueryOptions()),
  component: AdminNewProjectPage,
})
