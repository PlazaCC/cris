import { z } from 'zod'

export const footerSchema = z.object({
  documentId: z.string().optional(),
  attributes: z.any().optional(),
  brand: z.string().nullable().optional(),
  links: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
      })
    )
    .nullable()
    .optional(),
  year: z.string().nullable().optional(),
  copyright: z.string().nullable().optional(),
  colophon: z.string().nullable().optional(),
})
