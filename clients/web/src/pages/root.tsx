import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Footer } from '@/components/footer'
import { ErrorPage } from '@/pages/error-page'

export const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <>
        <Outlet />
        <Footer />
        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
      </>
    )
  },
  errorComponent: (props) => (
    <ErrorPage title="Erro na aplicação" showErrorMessage={true} {...props} />
  ),
})
