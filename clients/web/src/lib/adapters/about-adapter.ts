import { aboutSchema } from '@/features/about/schemas'
import type { AboutData } from '@/interrfaces'
import { getEntityFields } from './strapi-helpers'
import { mapResponsiveImage } from './strapi-image'

export function mapStrapiAboutToDomain(rawAbout: unknown): AboutData {
  const fields = getEntityFields<Record<string, unknown>>(rawAbout)
  const parsed = aboutSchema.parse(fields)

  return {
    title: parsed.title ?? '',
    body: parsed.body ?? '',
    clients: parsed.clients ?? [],
    skills: parsed.skills ?? [],
    image: mapResponsiveImage(parsed.image),
    email: parsed.email ?? '',
  }
}
