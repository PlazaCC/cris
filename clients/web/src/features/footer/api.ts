import { createServerFn } from '@tanstack/react-start'

import { footerInputSchema } from '@/features/footer/schemas'
import { mapFooterRowToDomain } from '@/lib/adapters/footer-adapter'
import { authMiddleware } from '@/server/auth-middleware'
import { db } from '@/server/db/client'
import { footer } from '@/server/db/schema'

export const getFooter = createServerFn({ method: 'GET' }).handler(async () => {
  const row = await db.query.footer.findFirst()
  return mapFooterRowToDomain(row)
})

export const updateFooter = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(footerInputSchema)
  .handler(async ({ data }) => {
    const values = { ...data, colophon: data.colophon || null }
    const [row] = await db
      .insert(footer)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({ target: footer.id, set: values })
      .returning()
    return mapFooterRowToDomain(row)
  })
