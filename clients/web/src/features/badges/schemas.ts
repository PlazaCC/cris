import { z } from 'zod'

export const badgeInputSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
})

export const badgeUpdateSchema = badgeInputSchema.extend({
  id: z.string().uuid(),
})
