import type { GlobalData } from '@/interfaces'
import { seoSchema } from '@/server/db/json-types'
import type { siteGlobal } from '@/server/db/schema'

type SiteGlobalRow = typeof siteGlobal.$inferSelect

// Linha ausente = single type ainda não preenchido → valores padrão
export function mapGlobalRowToDomain(row: SiteGlobalRow | undefined): GlobalData {
  return {
    siteName: row?.siteName ?? '',
    siteDescription: row?.siteDescription ?? '',
    favicon: row?.favicon ?? '',
    defaultSeo: row
      ? seoSchema.parse(row.defaultSeo)
      : { metaTitle: '', metaDescription: '', shareImage: '' },
  }
}
