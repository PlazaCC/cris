import { heroSchema } from '@/features/hero/schemas'
import type { HeroData } from '@/interfaces'
import { getEntityFields } from './strapi-helpers'
import { mapResponsiveImage } from './strapi-image'

export function mapStrapiHeroToDomain(rawHero: unknown): HeroData {
  const fields = getEntityFields<Record<string, unknown>>(rawHero)
  const parsed = heroSchema.parse(fields)

  return {
    highlight: parsed.highlight ?? '',
    title: parsed.title ?? '',
    subtitle: parsed.subtitle ?? '',
    name: parsed.name ?? '',
    description: parsed.description ?? '',
    image: mapResponsiveImage(parsed.image),
  }
}
