import { createFileRoute } from '@tanstack/react-router'

import { footerQueryOptions } from '@/features/footer/hooks/use-footer'
import { AdminFooterPage } from '@/pages/admin/footer'

export const Route = createFileRoute('/admin/_panel/footer')({
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(footerQueryOptions()),
  component: AdminFooterPage,
})
