import { z } from 'zod'

import type { FooterData } from '@/interfaces'
import { socialLinkSchema } from '@/server/db/json-types'
import type { footer } from '@/server/db/schema'

type FooterRow = typeof footer.$inferSelect

export function mapFooterRowToDomain(row: FooterRow | undefined): FooterData {
  return {
    brand: row?.brand ?? '',
    links: row ? z.array(socialLinkSchema).parse(row.links) : [],
    year: row?.year ?? '',
    copyright: row?.copyright ?? '',
    colophon: row?.colophon ?? undefined,
  }
}
