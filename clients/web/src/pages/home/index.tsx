import { rootRoute } from '@/pages/root'
import { createRoute } from '@tanstack/react-router'

HomePage.route = createRoute({
  path: '/',
  component: HomePage,
  getParentRoute: () => rootRoute,
})

export function HomePage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1>Bem vindo ao Workspace do Plaza</h1>
    </div>
  )
}
