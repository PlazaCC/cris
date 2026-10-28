import { z } from 'zod'

import {
  projectBlocksSchema,
  responsiveImageSchema,
} from '@/server/db/json-types'

export const projectInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use letras minúsculas, números e hífens'
    ),
  title: z.string().trim().min(1, 'Informe o título'),
  description: z.string(),
  year: z.string(),
  blurColor: z.string(),
  coverImages: responsiveImageSchema,
  // nomes dos badges, na ordem em que aparecem no projeto
  badges: z.array(z.string()),
  blocks: projectBlocksSchema,
})

export const projectUpdateSchema = projectInputSchema.extend({
  id: z.string().uuid(),
})

export const projectIdSchema = z.object({ id: z.string().uuid() })
