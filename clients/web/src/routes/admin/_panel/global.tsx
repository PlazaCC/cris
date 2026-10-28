import { createFileRoute } from '@tanstack/react-router'

import { globalQueryOptions } from '@/features/global/hooks/use-global'
import { AdminGlobalPage } from '@/pages/admin/global'

export const Route = createFileRoute('/admin/_panel/global')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(globalQueryOptions()),
  component: AdminGlobalPage,
})
