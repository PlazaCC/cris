import { createMiddleware } from '@tanstack/react-start'
import {
  getRequestHeaders,
  setResponseStatus,
} from '@tanstack/react-start/server'

import { auth } from '@/server/auth'

// Toda server function de escrita passa por aqui: sem sessão, responde 401
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() })

    if (!session) {
      setResponseStatus(401)
      throw new Error('Não autorizado')
    }

    return next({ context: { user: session.user } })
  }
)
