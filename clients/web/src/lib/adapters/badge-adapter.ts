import type { Badge } from '@/interrfaces'
import { getEntityFields } from './strapi-helpers'

export function mapStrapiBadgeToDomain(rawBadge: unknown): Badge {
  const fields = getEntityFields<Record<string, unknown>>(rawBadge)

  return {
    documentId: typeof fields.documentId === 'string' ? fields.documentId : '',
    name: typeof fields.name === 'string' ? fields.name : '',
    slug: typeof fields.slug === 'string' ? fields.slug : undefined,
  }
}

export function mapStrapiBadgesToNames(rawBadges: unknown): string[] {
  if (!Array.isArray(rawBadges)) {
    return []
  }

  return rawBadges
    .map((item) => mapStrapiBadgeToDomain(item).name)
    .filter((name) => Boolean(name))
}
