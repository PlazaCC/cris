import { createFileRoute, redirect } from '@tanstack/react-router'

import { getAdminUser } from '@/features/auth/api'
import { AdminLayout } from '@/pages/admin/layout'

// Toda página do painel passa por aqui: sem sessão, vai para o login
export const Route = createFileRoute('/admin/_panel')({
  beforeLoad: async () => {
    const user = await getAdminUser()

    if (!user) {
      throw redirect({ to: '/admin/login' })
    }

    return { user }
  },
  head: () => ({ meta: [{ title: 'Painel' }] }),
  component: AdminLayout,
})
