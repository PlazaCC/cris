import type { Project } from '@/interfaces'
import {
  projectBlocksSchema,
  responsiveImageSchema,
} from '@/server/db/json-types'
import type { badges, projectBadges, projects } from '@/server/db/schema'

export type ProjectRowWithBadges = typeof projects.$inferSelect & {
  projectBadges: (typeof projectBadges.$inferSelect & {
    badge: typeof badges.$inferSelect
  })[]
}

export function mapProjectRowToDomain(row: ProjectRowWithBadges): Project {
  return {
    documentId: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    year: row.year,
    blurColor: row.blurColor,
    badges: [...row.projectBadges]
      .sort((a, b) => a.position - b.position)
      .map(({ badge }) => badge.name),
    coverImages: responsiveImageSchema.parse(row.coverImage),
    blocks: projectBlocksSchema.parse(row.blocks),
  }
}
