import { z } from 'zod'

export const heroSchema = z.object({
  documentId: z.string().optional(),
  attributes: z.unknown().optional(),
  highlight: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image: z.unknown().nullable().optional(),
})
