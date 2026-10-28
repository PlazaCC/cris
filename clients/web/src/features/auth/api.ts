import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '@/server/auth'

export type AdminUser = {
  name: string
  email: string
}

export const getAdminUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminUser | null> => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    return session
      ? { name: session.user.name, email: session.user.email }
      : null
  }
)
