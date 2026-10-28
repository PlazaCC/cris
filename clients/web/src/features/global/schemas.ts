import { z } from 'zod'

import { seoSchema } from '@/server/db/json-types'

// Entrada do formulário do painel e da server function de escrita
export const globalInputSchema = z.object({
  siteName: z.string().trim().min(1, 'Informe o nome do site'),
  siteDescription: z.string(),
  favicon: z.string(),
  defaultSeo: seoSchema,
})
