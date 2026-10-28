import { z } from 'zod'

import { nameItemSchema, responsiveImageSchema } from '@/server/db/json-types'

const nameListSchema = z.array(
  nameItemSchema.extend({ name: z.string().trim().min(1, 'Informe o nome') })
)

export const aboutInputSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título'),
  body: z.string(),
  email: z.union([z.literal(''), z.string().trim().email('Email inválido')]),
  clients: nameListSchema,
  skills: nameListSchema,
  image: responsiveImageSchema,
})
