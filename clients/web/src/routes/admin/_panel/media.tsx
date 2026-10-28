import { createFileRoute } from '@tanstack/react-router'

import { mediaQueryOptions } from '@/features/media/hooks/use-media'
import { AdminMediaPage } from '@/pages/admin/media'

export const Route = createFileRoute('/admin/_panel/media')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(mediaQueryOptions()),
  component: AdminMediaPage,
})
