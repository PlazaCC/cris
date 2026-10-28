import { createServerFn } from '@tanstack/react-start'
import { and, eq, ne } from 'drizzle-orm'
import { z } from 'zod'

import { badgeInputSchema, badgeUpdateSchema } from '@/features/badges/schemas'
import { mapBadgeRowToDomain } from '@/lib/adapters/badge-adapter'
import { slugify } from '@/lib/slug'
import { authMiddleware } from '@/server/auth-middleware'
import { db } from '@/server/db/client'
import { badges } from '@/server/db/schema'

export const getBadges = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db.query.badges.findMany({
    orderBy: (badge, { asc }) => [asc(badge.name)],
  })
  return rows.map(mapBadgeRowToDomain)
})

async function assertNameAvailable(name: string, ignoreId?: string) {
  const taken = await db.query.badges.findFirst({
    where: ignoreId
      ? and(eq(badges.name, name), ne(badges.id, ignoreId))
      : eq(badges.name, name),
  })

  if (taken) {
    throw new Error(`Já existe um badge chamado "${name}"`)
  }
}

export const createBadge = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(badgeInputSchema)
  .handler(async ({ data }) => {
    await assertNameAvailable(data.name)
    const [row] = await db
      .insert(badges)
      .values({ name: data.name, slug: slugify(data.name) })
      .returning()
    return mapBadgeRowToDomain(row)
  })

export const updateBadge = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(badgeUpdateSchema)
  .handler(async ({ data }) => {
    await assertNameAvailable(data.name, data.id)
    const [row] = await db
      .update(badges)
      .set({ name: data.name, slug: slugify(data.name) })
      .where(eq(badges.id, data.id))
      .returning()
    return mapBadgeRowToDomain(row)
  })

// Os vínculos com projetos somem junto (on delete cascade)
export const deleteBadge = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await db.delete(badges).where(eq(badges.id, data.id))
  })
