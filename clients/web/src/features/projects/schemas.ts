import { z } from 'zod'

const paragraphItemSchema = z.object({
  content: z.string().optional(),
})

const responsiveImageSchema = z.object({
  desktop: z.unknown().optional(),
  mobile: z.unknown().optional(),
})

const projectBlockSchema = z.object({
  __component: z.string(),
  title: z.string().optional(),
  text: z.string().optional(),
  paragraphs: z.array(paragraphItemSchema).optional(),
  items: z.array(paragraphItemSchema).optional(),
  images: z.array(responsiveImageSchema).optional(),
  results: z
    .array(
      z.object({
        value: z.string().optional(),
        positive: z.boolean().optional(),
        label: z.string().optional(),
      })
    )
    .optional(),
})

export const projectSchema = z.object({
  documentId: z.string().optional(),
  attributes: z.any().optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  year: z.string().optional(),
  blur_color: z.string().optional(),
  badges: z.array(z.unknown()).optional(),
  cover_images: z.unknown().optional(),
  blocks: z.array(projectBlockSchema).optional(),
})

export const strapiCollectionResponseSchema = z.object({
  data: z.array(z.unknown()),
  meta: z.unknown().optional(),
})
