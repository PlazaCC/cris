import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'

import { ThemeProvider } from '@/contexts/theme/provider'
import { footerQueryOptions } from '@/features/footer/hooks/use-footer'
import { globalQueryOptions } from '@/features/global/hooks/use-global'
import { ErrorPage } from '@/pages/error-page'

import globalCss from '@/global.scss?url'
import indexCss from '@/index.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  loader: async ({ context }) => {
    // prefetch não lança erro: se o banco falhar, as seções exibem o próprio ErrorState
    await Promise.all([
      context.queryClient.prefetchQuery(globalQueryOptions()),
      context.queryClient.prefetchQuery(footerQueryOptions()),
    ])

    return {
      global:
        context.queryClient.getQueryData(globalQueryOptions().queryKey) ?? null,
    }
  },
  head: ({ loaderData }) => {
    const global = loaderData?.global

    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { title: global?.defaultSeo.metaTitle || 'Plaza Workspace' },
        ...(global?.defaultSeo.metaDescription
          ? [
              {
                name: 'description',
                content: global.defaultSeo.metaDescription,
              },
            ]
          : []),
      ],
      links: [
        { rel: 'stylesheet', href: globalCss },
        { rel: 'stylesheet', href: indexCss },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/favicon/apple-touch-icon.png',
        },
        global?.favicon
          ? { rel: 'icon', href: global.favicon }
          : {
              rel: 'icon',
              type: 'image/png',
              sizes: '32x32',
              href: '/favicon/favicon-32x32.png',
            },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    }
  },
  shellComponent: RootDocument,
  component: RootComponent,
  errorComponent: (props) => (
    <ErrorPage title="Erro na aplicação" showErrorMessage={true} {...props} />
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

// Footer, Menu e smooth scroll ficam no AppLayout: o /admin não herda o site
function RootComponent() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Outlet />
      <Toaster position="top-center" />
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
          { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
    </ThemeProvider>
  )
}
