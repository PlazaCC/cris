import { createFileRoute } from '@tanstack/react-router'

import { projectsQueryOptions } from '@/features/projects/hooks/use-projects'
import { AdminProjectsPage } from '@/pages/admin/projects/list'

export const Route = createFileRoute('/admin/_panel/projects/')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(projectsQueryOptions()),
  component: AdminProjectsPage,
})
