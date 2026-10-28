import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSignIn } from '@/features/auth/hooks/use-auth-actions'

import { Field } from './components/field'

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

export function AdminLoginPage() {
  const router = useRouter()
  const signIn = useSignIn()
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const { errors } = form.formState

  return (
    <main className="bg-muted/40 text-foreground flex min-h-dvh items-center justify-center p-4 font-sans">
      <form
        noValidate
        className="bg-card flex w-full max-w-sm flex-col gap-5 rounded-xl border p-6 shadow-sm"
        onSubmit={form.handleSubmit((values) =>
          signIn.mutate(values, {
            onSuccess: () => router.navigate({ to: '/admin' }),
          })
        )}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Entrar no painel</h1>
          <p className="text-muted-foreground text-sm">
            Use o email e a senha do admin.
          </p>
        </div>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...form.register('email')}
          />
        </Field>
        <Field
          label="Senha"
          htmlFor="password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...form.register('password')}
          />
        </Field>

        {signIn.error && (
          <p className="text-destructive text-sm" role="alert">
            {signIn.error.message}
          </p>
        )}

        <Button type="submit" disabled={signIn.isPending}>
          {signIn.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </main>
  )
}
