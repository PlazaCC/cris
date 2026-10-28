import { z } from 'zod'

// Formulário público (o site é em inglês). `website` é um honeypot: fica
// escondido do visitante, então só robôs preenchem
export const contactInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please tell me your name')
    .max(120, 'Name is too long')
    .regex(/^[^\r\n]*$/, 'Name must be a single line'),
  email: z.string().trim().email('Please enter a valid email').max(200),
  message: z
    .string()
    .trim()
    .min(10, 'Tell me a bit more (10+ characters)')
    .max(5000, 'Message is too long (5000 characters max)'),
  website: z.string().max(200).optional(),
})

export const contactIdSchema = z.object({ id: z.string().uuid() })

export const contactReadSchema = contactIdSchema.extend({ read: z.boolean() })

/*
 * `password` vazio mantém a senha salva; `clearPassword` apaga. Com o envio
 * ligado, servidor, remetente e destino passam a ser obrigatórios.
 */
export const mailSettingsInputSchema = z
  .object({
    enabled: z.boolean(),
    host: z.string().trim().max(255),
    port: z
      .number({ error: 'Porta inválida' })
      .int('Porta inválida')
      .min(1, 'Porta inválida')
      .max(65535, 'Porta inválida'),
    secure: z.boolean(),
    username: z.string().trim().max(255),
    password: z.string().max(500),
    clearPassword: z.boolean(),
    fromAddress: z.string().trim().max(255),
    toAddress: z.union([
      z.literal(''),
      z.string().trim().email('Email inválido'),
    ]),
  })
  .superRefine((value, ctx) => {
    if (!value.enabled) return
    const required = [
      ['host', 'Informe o servidor SMTP'],
      ['fromAddress', 'Informe o remetente'],
      ['toAddress', 'Informe para onde enviar'],
    ] as const
    for (const [field, message] of required) {
      if (!value[field]) {
        ctx.addIssue({ code: 'custom', path: [field], message })
      }
    }
  })
