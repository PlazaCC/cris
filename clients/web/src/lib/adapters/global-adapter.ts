import { globalSchema } from '@/features/global/schemas'
import type { GlobalData } from '@/interrfaces'
import { getEntityFields } from './strapi-helpers'
import { mapStrapiMediaToUrl } from './strapi-image'

export function mapStrapiGlobalToDomain(rawGlobal: unknown): GlobalData {
  const fields = getEntityFields<Record<string, unknown>>(rawGlobal)
  const parsed = globalSchema.parse(fields)

  return {
    siteName: parsed.siteName ?? '',
    siteDescription: parsed.siteDescription ?? '',
    favicon: mapStrapiMediaToUrl(parsed.favicon),
    defaultSeo: {
      metaTitle: parsed.defaultSeo?.metaTitle ?? '',
      metaDescription: parsed.defaultSeo?.metaDescription ?? '',
      shareImage: mapStrapiMediaToUrl(parsed.defaultSeo?.shareImage),
    },
  }
}
