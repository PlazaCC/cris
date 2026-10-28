import { createFileRoute, redirect } from '@tanstack/react-router'

import { getAdminUser } from '@/features/auth/api'
import { AdminLoginPage } from '@/pages/admin/login'

export const Route = createFileRoute('/admin/login')({
  beforeLoad: async () => {
    if (await getAdminUser()) {
      throw redirect({ to: '/admin' })
    }
  },
  head: () => ({ meta: [{ title: 'Entrar · Painel' }] }),
  component: AdminLoginPage,
})
