import { z } from 'zod'

export const strapiSingleResponseSchema = z.object({
  data: z.unknown(),
  meta: z.unknown().optional(),
})

export const strapiCollectionResponseSchema = z.object({
  data: z.array(z.unknown()),
  meta: z.unknown().optional(),
})
