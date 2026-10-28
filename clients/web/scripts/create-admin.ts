/**
 * Cria (ou redefine a senha de) um admin do painel. O cadastro público fica
 * desligado, então este é o único jeito de criar uma conta.
 *
 * Uso: yarn workspace client-web auth:create-admin <email> <senha> [nome]
 */
import { auth } from '../src/server/auth'

const [email, password, name = 'Admin'] = process.argv.slice(2)

if (!email || !password) {
  console.error('Uso: auth:create-admin <email> <senha> [nome]')
  process.exit(1)
}

if (password.length < 8) {
  console.error('A senha precisa ter pelo menos 8 caracteres')
  process.exit(1)
}

const ctx = await auth.$context
const hash = await ctx.password.hash(password)
const existing = await ctx.internalAdapter.findUserByEmail(email, {
  includeAccounts: true,
})

if (existing) {
  const credential = existing.accounts.find(
    (account) => account.providerId === 'credential'
  )

  if (credential) {
    await ctx.internalAdapter.updatePassword(existing.user.id, hash)
  } else {
    await ctx.internalAdapter.linkAccount({
      userId: existing.user.id,
      providerId: 'credential',
      accountId: existing.user.id,
      password: hash,
    })
  }

  console.log(`Senha atualizada para ${email}`)
} else {
  const user = await ctx.internalAdapter.createUser(
    { email, name, emailVerified: true },
    { method: 'admin' }
  )

  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: 'credential',
    accountId: user.id,
    password: hash,
  })

  console.log(`Admin criado: ${email}`)
}
