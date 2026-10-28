import { createFileRoute } from '@tanstack/react-router'

import { badgesQueryOptions } from '@/features/badges/hooks/use-badges'
import { projectByIdQueryOptions } from '@/features/projects/hooks/use-project-by-id'
import { AdminEditProjectPage } from '@/pages/admin/projects/editor'

export const Route = createFileRoute('/admin/_panel/projects/$projectId')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.prefetchQuery(
        projectByIdQueryOptions(params.projectId)
      ),
      context.queryClient.prefetchQuery(badgesQueryOptions()),
    ]),
  component: AdminEditProjectPage,
})
