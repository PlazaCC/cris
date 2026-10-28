import { createServerFn } from '@tanstack/react-start'
import { del, head } from '@vercel/blob'
import { desc, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import { mapMediaRowToDomain } from '@/lib/adapters/media-adapter'
import { authMiddleware } from '@/server/auth-middleware'
import { db } from '@/server/db/client'
import { media } from '@/server/db/schema'

export const getMedia = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const rows = await db.select().from(media).orderBy(desc(media.createdAt))
    return rows.map(mapMediaRowToDomain)
  })

/*
 * O navegador sobe o arquivo direto para o Blob (routes/api/upload.ts) e
 * depois registra a URL aqui. O `head()` confirma que o arquivo existe no
 * nosso store e traz tamanho e tipo do próprio Blob, não do cliente.
 */
export const registerMedia = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ url: z.string().url() }))
  .handler(async ({ data }) => {
    const blob = await head(data.url)
    const [row] = await db
      .insert(media)
      .values({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
        size: blob.size,
      })
      .onConflictDoUpdate({ target: media.url, set: { size: blob.size } })
      .returning()
    return mapMediaRowToDomain(row)
  })

// Procura a URL em todo conteúdo que guarda imagens (colunas texto e jsonb)
async function isInUse(url: string) {
  const result = await db.execute<{ used: boolean }>(sql`
    select (
      exists (
        select 1 from projects
        where strpos(cover_image::text || blocks::text, ${url}) > 0
      )
      or exists (select 1 from about where strpos(image::text, ${url}) > 0)
      or exists (
        select 1 from site_global
        where strpos(favicon || default_seo::text, ${url}) > 0
      )
    ) as used
  `)
  return Boolean(result.rows[0]?.used)
}

export const deleteMedia = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const row = await db.query.media.findFirst({
      where: eq(media.id, data.id),
    })

    if (!row) return

    if (await isInUse(row.url)) {
      throw new Error('Esta imagem ainda está em uso no site')
    }

    await del(row.url)
    await db.delete(media).where(eq(media.id, row.id))
  })
