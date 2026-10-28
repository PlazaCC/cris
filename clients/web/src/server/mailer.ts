import { eq } from 'drizzle-orm'
import nodemailer from 'nodemailer'

import { db } from '@/server/db/client'
import { contactMessages, mailSettings } from '@/server/db/schema'
import { decryptSecret } from '@/server/secret-box'

type MailSettingsRow = typeof mailSettings.$inferSelect
type ContactMessageRow = typeof contactMessages.$inferSelect

type Mail = {
  subject: string
  text: string
  replyTo?: string
}

/*
 * Envia com o SMTP salvo no painel. Os timeouts são curtos de propósito: o
 * envio acontece dentro da request do formulário, e um servidor travado não
 * pode segurar a resposta para o visitante.
 */
export async function sendMail(settings: MailSettingsRow, mail: Mail) {
  if (!settings.host || !settings.fromAddress || !settings.toAddress) {
    throw new Error('SMTP incompleto: preencha servidor, remetente e destino')
  }

  let password: string | undefined
  if (settings.passwordEncrypted) {
    try {
      password = decryptSecret(settings.passwordEncrypted)
    } catch {
      throw new Error('Não deu para ler a senha do SMTP; salve-a de novo')
    }
  }

  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.username
      ? { user: settings.username, pass: password }
      : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  })

  try {
    await transport.sendMail({
      from: settings.fromAddress,
      to: settings.toAddress,
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
    })
  } finally {
    transport.close()
  }
}

function contactMail(message: ContactMessageRow): Mail {
  return {
    subject: `Nova mensagem do site: ${message.name}`,
    replyTo: `${message.name} <${message.email}>`,
    text: [
      `Nome: ${message.name}`,
      `Email: ${message.email}`,
      `Recebida em: ${message.createdAt.toISOString()}`,
      '',
      message.message,
      '',
      '— Enviada pelo formulário "get in touch". A mensagem também está no painel.',
    ].join('\n'),
  }
}

/*
 * Tenta avisar por e-mail sobre uma mensagem já salva e grava o resultado
 * nela. Nunca lança: a mensagem já está no banco, então falhar aqui só muda
 * o status que o painel mostra.
 */
export async function notifyContactMessage(message: ContactMessageRow) {
  const settings = await db.query.mailSettings.findFirst()

  if (!settings?.enabled) {
    const [row] = await db
      .update(contactMessages)
      .set({ emailStatus: 'disabled', emailError: null })
      .where(eq(contactMessages.id, message.id))
      .returning()
    return row
  }

  const attempts = message.emailAttempts + 1

  try {
    await sendMail(settings, contactMail(message))
    const [row] = await db
      .update(contactMessages)
      .set({
        emailStatus: 'sent',
        emailError: null,
        emailAttempts: attempts,
        emailedAt: new Date(),
      })
      .where(eq(contactMessages.id, message.id))
      .returning()
    return row
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    const [row] = await db
      .update(contactMessages)
      .set({
        emailStatus: 'failed',
        emailError: reason.slice(0, 500),
        emailAttempts: attempts,
      })
      .where(eq(contactMessages.id, message.id))
      .returning()
    return row
  }
}
