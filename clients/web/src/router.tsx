import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'

import { rootRoute } from './pages/root'

import { AppLayout } from './pages/_layout'
import { AboutPage } from './pages/about'
import { HomePage } from './pages/home'
import { WorkPage } from './pages/work'

const queryClient = new QueryClient()

const routeTree = rootRoute.addChildren([
  AppLayout.route.addChildren([
    HomePage.route,
    AboutPage.route,
    WorkPage.route,
  ]),
])

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
