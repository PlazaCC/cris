import { z } from 'zod'

import type { AboutData } from '@/interfaces'
import {
  emptyResponsiveImage,
  nameItemSchema,
  responsiveImageSchema,
} from '@/server/db/json-types'
import type { about } from '@/server/db/schema'

type AboutRow = typeof about.$inferSelect

const nameListSchema = z.array(nameItemSchema)

export function mapAboutRowToDomain(row: AboutRow | undefined): AboutData {
  return {
    title: row?.title ?? '',
    body: row?.body ?? '',
    clients: row ? nameListSchema.parse(row.clients) : [],
    skills: row ? nameListSchema.parse(row.skills) : [],
    image: row ? responsiveImageSchema.parse(row.image) : emptyResponsiveImage,
    email: row?.email ?? '',
  }
}
