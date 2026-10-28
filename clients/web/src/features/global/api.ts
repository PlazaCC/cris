import { createServerFn } from '@tanstack/react-start'

import { globalInputSchema } from '@/features/global/schemas'
import { mapGlobalRowToDomain } from '@/lib/adapters/global-adapter'
import { authMiddleware } from '@/server/auth-middleware'
import { db } from '@/server/db/client'
import { siteGlobal } from '@/server/db/schema'

export const getGlobal = createServerFn({ method: 'GET' }).handler(async () => {
  const row = await db.query.siteGlobal.findFirst()
  return mapGlobalRowToDomain(row)
})

export const updateGlobal = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(globalInputSchema)
  .handler(async ({ data }) => {
    const [row] = await db
      .insert(siteGlobal)
      .values({ id: 1, ...data })
      .onConflictDoUpdate({ target: siteGlobal.id, set: data })
      .returning()
    return mapGlobalRowToDomain(row)
  })
