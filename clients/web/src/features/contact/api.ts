import { createServerFn } from '@tanstack/react-start'
import { getRequestIP, setResponseStatus } from '@tanstack/react-start/server'
import { and, count, desc, eq, gt } from 'drizzle-orm'

import {
  contactIdSchema,
  contactInputSchema,
  contactReadSchema,
  mailSettingsInputSchema,
} from '@/features/contact/schemas'
import {
  mapContactMessageRowToDomain,
  mapMailSettingsRowToDomain,
} from '@/lib/adapters/contact-adapter'
import { authMiddleware } from '@/server/auth-middleware'
import { db } from '@/server/db/client'
import { contactMessages, mailSettings } from '@/server/db/schema'
import { notifyContactMessage, sendMail } from '@/server/mailer'
import { encryptSecret, hashWithSecret } from '@/server/secret-box'

const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 }

/*
 * Público. Primeiro salva, depois tenta o e-mail: a mensagem nunca se perde
 * por causa do SMTP, e o visitante recebe sucesso nos dois casos (o que
 * aconteceu com o e-mail aparece só no painel).
 */
export const submitContactMessage = createServerFn({ method: 'POST' })
  .validator(contactInputSchema)
  .handler(async ({ data }) => {
    // Honeypot preenchido: finge sucesso e descarta
    if (data.website) {
      return { ok: true }
    }

    const ip = getRequestIP({ xForwardedFor: true })
    const ipHash = ip ? hashWithSecret(ip) : null

    if (ipHash) {
      const since = new Date(Date.now() - RATE_LIMIT.windowMs)
      const [recent] = await db
        .select({ total: count() })
        .from(contactMessages)
        .where(
          and(
            eq(contactMessages.ipHash, ipHash),
            gt(contactMessages.createdAt, since)
          )
        )

      if (recent.total >= RATE_LIMIT.max) {
        setResponseStatus(429)
        throw new Error(
          'Too many messages in a short time. Please try again later.'
        )
      }
    }

    const [row] = await db
      .insert(contactMessages)
      .values({
        name: data.name,
        email: data.email,
        message: data.message,
        ipHash,
      })
      .returning()

    await notifyContactMessage(row)
    return { ok: true }
  })

export const getContactMessages = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const rows = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
    return rows.map(mapContactMessageRowToDomain)
  })

export const setContactMessageRead = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(contactReadSchema)
  .handler(async ({ data }) => {
    const [row] = await db
      .update(contactMessages)
      .set({ readAt: data.read ? new Date() : null })
      .where(eq(contactMessages.id, data.id))
      .returning()
    return mapContactMessageRowToDomain(row)
  })

export const deleteContactMessage = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(contactIdSchema)
  .handler(async ({ data }) => {
    await db.delete(contactMessages).where(eq(contactMessages.id, data.id))
  })

export const resendContactMessage = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(contactIdSchema)
  .handler(async ({ data }) => {
    const message = await db.query.contactMessages.findFirst({
      where: eq(contactMessages.id, data.id),
    })
    if (!message) {
      throw new Error('Mensagem não encontrada')
    }
    return mapContactMessageRowToDomain(await notifyContactMessage(message))
  })

export const getMailSettings = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const row = await db.query.mailSettings.findFirst()
    return mapMailSettingsRowToDomain(row)
  })

// Senha vazia mantém a salva (não entra no update)
function passwordChange(password: string, clearPassword: boolean) {
  if (clearPassword) {
    return { passwordEncrypted: null }
  }
  if (password) {
    return { passwordEncrypted: encryptSecret(password) }
  }
  return {}
}

export const updateMailSettings = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(mailSettingsInputSchema)
  .handler(async ({ data }) => {
    const { password, clearPassword, ...fields } = data
    const values = { ...fields, ...passwordChange(password, clearPassword) }

    const [row] = await db
      .insert(mailSettings)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({ target: mailSettings.id, set: values })
      .returning()
    return mapMailSettingsRowToDomain(row)
  })

// Usa o que está salvo, mesmo com o envio desligado, para testar antes de ligar
export const sendTestMail = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async () => {
    const settings = await db.query.mailSettings.findFirst()
    if (!settings) {
      throw new Error('Salve as configurações antes de testar')
    }

    await sendMail(settings, {
      subject: 'Teste do SMTP do site',
      text: 'Se este e-mail chegou, as mensagens do formulário "get in touch" também vão chegar.',
    })
    return { to: settings.toAddress }
  })
