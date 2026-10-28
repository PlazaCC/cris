import type { Badge } from '@/interfaces'
import type { badges } from '@/server/db/schema'

type BadgeRow = typeof badges.$inferSelect

export function mapBadgeRowToDomain(row: BadgeRow): Badge {
  return {
    documentId: row.id,
    name: row.name,
    slug: row.slug,
  }
}
