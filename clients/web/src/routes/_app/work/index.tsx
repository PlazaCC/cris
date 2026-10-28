import { createFileRoute, redirect } from '@tanstack/react-router'

import { projectsQueryOptions } from '@/features/projects/hooks/use-projects'

// "work" no menu abre o primeiro projeto da lista (mesma ordem da home).
// Sem projetos (ou com erro no banco) volta para a home, que mostra o estado.
export const Route = createFileRoute('/_app/work/')({
  loader: async ({ context }) => {
    const options = projectsQueryOptions()
    await context.queryClient.prefetchQuery(options)
    const [first] = context.queryClient.getQueryData(options.queryKey) ?? []

    if (!first) throw redirect({ to: '/' })
    throw redirect({ to: '/work/$slug', params: { slug: first.slug } })
  },
})
