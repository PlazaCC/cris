import type { ContactMessage, MailSettings } from '@/interfaces'
import type { contactMessages, mailSettings } from '@/server/db/schema'

type ContactMessageRow = typeof contactMessages.$inferSelect
type MailSettingsRow = typeof mailSettings.$inferSelect

export function mapContactMessageRowToDomain(
  row: ContactMessageRow
): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    emailStatus: row.emailStatus,
    emailError: row.emailError,
    emailAttempts: row.emailAttempts,
    emailedAt: row.emailedAt?.toISOString() ?? null,
    read: row.readAt !== null,
    createdAt: row.createdAt.toISOString(),
  }
}

// Sem linha ainda: SMTP desligado, com a porta de submission padrão
export function mapMailSettingsRowToDomain(
  row: MailSettingsRow | undefined
): MailSettings {
  return {
    enabled: row?.enabled ?? false,
    host: row?.host ?? '',
    port: row?.port ?? 587,
    secure: row?.secure ?? false,
    username: row?.username ?? '',
    hasPassword: Boolean(row?.passwordEncrypted),
    fromAddress: row?.fromAddress ?? '',
    toAddress: row?.toAddress ?? '',
  }
}
