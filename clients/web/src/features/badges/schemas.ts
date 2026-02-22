import { z } from 'zod'

export const badgeSchema = z.object({
  documentId: z.string().optional(),
  attributes: z.any().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
})
