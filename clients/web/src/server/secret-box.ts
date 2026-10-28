import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'

/*
 * Cifra segredos guardados no banco (hoje, a senha do SMTP) com AES-256-GCM.
 * A chave sai do BETTER_AUTH_SECRET: trocar o secret invalida o que foi
 * salvo, e a senha precisa ser digitada de novo no painel.
 */
function key() {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET não definido')
  }
  return createHash('sha256').update(`secret-box:${secret}`).digest()
}

export function encryptSecret(plain: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const parts = [iv, cipher.getAuthTag(), data].map((part) =>
    part.toString('base64')
  )
  return ['v1', ...parts].join(':')
}

export function decryptSecret(sealed: string) {
  const [version, iv, tag, data] = sealed.split(':')
  if (version !== 'v1' || !iv || !tag || !data) {
    throw new Error('Segredo em formato inválido')
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key(),
    Buffer.from(iv, 'base64')
  )
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(data, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}

// Hash com o secret, para guardar identificadores (IP) sem guardar o valor
export function hashWithSecret(value: string) {
  return createHash('sha256')
    .update(`${key().toString('hex')}:${value}`)
    .digest('hex')
}
