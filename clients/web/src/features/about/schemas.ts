import { z } from 'zod'

const aboutItemSchema = z.object({
  name: z.string().min(1),
})

export const aboutSchema = z.object({
  documentId: z.string().optional(),
  attributes: z.unknown().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  clients: z.array(aboutItemSchema).optional(),
  skills: z.array(aboutItemSchema).optional(),
  image: z.unknown().optional(),
  email: z.string().optional(),
})

export const strapiSingleResponseSchema = z.object({
  data: z.unknown(),
  meta: z.unknown().optional(),
})
