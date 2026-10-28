import { createFileRoute } from '@tanstack/react-router'

import { projectsQueryOptions } from '@/features/projects/hooks/use-projects'
import { HomePage } from '@/pages/home'

export const Route = createFileRoute('/_app/')({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(projectsQueryOptions())
  },
  component: HomePage,
})
