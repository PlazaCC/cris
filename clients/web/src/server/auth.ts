import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { db } from '@/server/db/client'
import * as schema from '@/server/db/schema'

// Só email e senha, sem cadastro público: o admin é criado por
// `yarn workspace client-web auth:create-admin`
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
    // neon-http não suporta transações interativas
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  // tanstackStartCookies precisa ser o último plugin
  plugins: [tanstackStartCookies()],
})
