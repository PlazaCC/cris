import { footerSchema } from '@/features/footer/schemas'
import type { FooterData } from '@/interrfaces'
import { getEntityFields } from './strapi-helpers'

export function mapStrapiFooterToDomain(rawFooter: unknown): FooterData {
  const fields = getEntityFields<Record<string, unknown>>(rawFooter)
  const parsed = footerSchema.parse(fields)

  return {
    brand: parsed.brand ?? '',
    links: parsed.links ?? [],
    year: parsed.year ?? '',
    copyright: parsed.copyright ?? '',
    colophon: parsed.colophon,
  }
}
