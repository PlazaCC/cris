import { createFileRoute } from '@tanstack/react-router'

import { aboutQueryOptions } from '@/features/about/hooks/use-about'
import { AboutPage } from '@/pages/about'

export const Route = createFileRoute('/_app/about')({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(aboutQueryOptions())
  },
  component: AboutPage,
})
