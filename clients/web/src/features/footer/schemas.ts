import { z } from 'zod'

export const footerInputSchema = z.object({
  brand: z.string().trim().min(1, 'Informe a marca'),
  year: z.string(),
  copyright: z.string(),
  colophon: z.string().optional(),
  links: z.array(
    z.object({
      title: z.string().trim().min(1, 'Informe o título'),
      url: z.string().trim().min(1, 'Informe a URL'),
    })
  ),
})
