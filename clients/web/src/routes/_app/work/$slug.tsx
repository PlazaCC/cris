import { createFileRoute, notFound } from '@tanstack/react-router'

import { projectQueryOptions } from '@/features/projects/hooks/use-project'
import { projectsQueryOptions } from '@/features/projects/hooks/use-projects'
import { ProjectPage } from '@/pages/work'

export const Route = createFileRoute('/_app/work/$slug')({
  loader: async ({ context, params }) => {
    const options = projectQueryOptions(params.slug)
    await Promise.all([
      context.queryClient.prefetchQuery(options),
      // Lista completa para o "Next Project"
      context.queryClient.prefetchQuery(projectsQueryOptions()),
    ])

    // `null` é "não existe"; erro de banco fica no cache e a página mostra o ErrorState
    const project = context.queryClient.getQueryData(options.queryKey)
    if (project === null) throw notFound()

    return project
      ? { title: project.title, description: project.description }
      : undefined
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: 'description', content: loaderData.description },
        ]
      : [],
  }),
  component: ProjectPage,
})
