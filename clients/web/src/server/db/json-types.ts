import { z } from 'zod'

/**
 * Schemas Zod dos campos jsonb.
 *
 * O banco também é uma fronteira: adapters validam o jsonb com estes schemas
 * antes de devolver o tipo de domínio (o formato espelha `@/interfaces`).
 */

export const responsiveImageSchema = z.object({
  desktop: z.string(),
  mobile: z.string(),
})

export const nameItemSchema = z.object({
  name: z.string(),
})

export const socialLinkSchema = z.object({
  title: z.string(),
  url: z.string(),
})

export const seoSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  shareImage: z.string(),
})

export const projectBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('scope'),
    title: z.string(),
    paragraphs: z.array(z.string()),
  }),
  z.object({
    type: z.literal('quote-title'),
    text: z.string(),
  }),
  z.object({
    type: z.literal('paragraph'),
    items: z.array(z.string()),
  }),
  z.object({
    type: z.literal('images'),
    images: z.array(responsiveImageSchema),
  }),
  z.object({
    type: z.literal('results'),
    results: z.array(
      z.object({
        value: z.string(),
        positive: z.boolean(),
        label: z.string(),
      })
    ),
  }),
])

export const projectBlocksSchema = z.array(projectBlockSchema)

export const emptyResponsiveImage = { desktop: '', mobile: '' }
