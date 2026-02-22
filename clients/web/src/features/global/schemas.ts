import { z } from 'zod'

export const globalSchema = z.object({
  attributes: z.unknown().optional(),
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  favicon: z.unknown().optional(),
  defaultSeo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      shareImage: z.unknown().optional(),
    })
    .optional(),
})
