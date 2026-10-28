import { createServerFn } from '@tanstack/react-start'

import { aboutInputSchema } from '@/features/about/schemas'
import { mapAboutRowToDomain } from '@/lib/adapters/about-adapter'
import { authMiddleware } from '@/server/auth-middleware'
import { db } from '@/server/db/client'
import { about } from '@/server/db/schema'

export const getAbout = createServerFn({ method: 'GET' }).handler(async () => {
  const row = await db.query.about.findFirst()
  return mapAboutRowToDomain(row)
})

export const updateAbout = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(aboutInputSchema)
  .handler(async ({ data }) => {
    const [row] = await db
      .insert(about)
      .values({ id: 1, ...data })
      .onConflictDoUpdate({ target: about.id, set: data })
      .returning()
    return mapAboutRowToDomain(row)
  })
