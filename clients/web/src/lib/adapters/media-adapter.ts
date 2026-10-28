import type { MediaItem } from '@/interfaces'
import type { media } from '@/server/db/schema'

type MediaRow = typeof media.$inferSelect

export function mapMediaRowToDomain(row: MediaRow): MediaItem {
  return {
    id: row.id,
    url: row.url,
    pathname: row.pathname,
    contentType: row.contentType,
    size: row.size,
    alt: row.alt,
    createdAt: row.createdAt.toISOString(),
  }
}
