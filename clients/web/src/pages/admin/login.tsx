import { rootRoute } from '@/pages/root'
import { createRoute } from '@tanstack/react-router'

AdminRedirectPage.route = createRoute({
  path: '/admin',
  getParentRoute: () => rootRoute,
  beforeLoad: () => {
    const cmsUrl =
      import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337'
    window.location.replace(`${cmsUrl}/admin`)
  },
  component: AdminRedirectPage,
})

export function AdminRedirectPage() {
  return null
}
