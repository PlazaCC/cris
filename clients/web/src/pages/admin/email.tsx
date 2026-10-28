import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useMailSettings,
  useSendTestMail,
  useUpdateMailSettings,
} from '@/features/contact/hooks/use-mail-settings'
import { mailSettingsInputSchema } from '@/features/contact/schemas'
import type { MailSettings } from '@/interfaces'
import { errorMessage } from '@/lib/error-message'

import { Field, PageHeader, SaveBar, Section } from './components/field'
import { QueryState } from './components/query-state'

type MailSettingsInput = z.infer<typeof mailSettingsInputSchema>

export function AdminEmailPage() {
  const query = useMailSettings()

  return (
    <>
      <PageHeader
        title="E-mail"
        description="SMTP usado para avisar você de cada mensagem nova. Sem ele, as mensagens continuam chegando no painel."
      />
      <QueryState query={query}>
        {(settings) => <MailSettingsForm settings={settings} />}
      </QueryState>
    </>
  )
}

// A senha nunca volta do servidor: o campo começa vazio e vazio = manter
function toInput(settings: MailSettings): MailSettingsInput {
  return {
    enabled: settings.enabled,
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    username: settings.username,
    password: '',
    clearPassword: false,
    fromAddress: settings.fromAddress,
    toAddress: settings.toAddress,
  }
}

function MailSettingsForm({ settings }: { settings: MailSettings }) {
  const updateSettings = useUpdateMailSettings()
  const sendTest = useSendTestMail()
  const form = useForm<MailSettingsInput>({
    resolver: zodResolver(mailSettingsInputSchema),
    defaultValues: toInput(settings),
  })
  const { errors, isDirty } = form.formState
  const clearPassword = form.watch('clearPassword')

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit((values) =>
        updateSettings.mutate(values, {
          onSuccess: (saved) => {
            form.reset(toInput(saved))
            toast.success('Configurações de e-mail salvas')
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      )}
    >
      <Section title="Envio">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="accent-primary mt-0.5 size-4"
            {...form.register('enabled')}
          />
          <span className="flex flex-col gap-0.5">
            <span className="font-medium">Enviar e-mail a cada mensagem</span>
            <span className="text-muted-foreground text-xs">
              Desligado, as mensagens só aparecem em Mensagens.
            </span>
          </span>
        </label>
      </Section>

      <Section
        title="Servidor SMTP"
        description="Gmail: smtp.gmail.com, porta 465 com SSL e uma senha de app. Outros provedores (Resend, Brevo, Zoho...) mostram esses dados no painel deles."
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <Field label="Servidor" htmlFor="host" error={errors.host?.message}>
            <Input
              id="host"
              placeholder="smtp.exemplo.com"
              aria-invalid={Boolean(errors.host)}
              {...form.register('host')}
            />
          </Field>
          <Field label="Porta" htmlFor="port" error={errors.port?.message}>
            <Input
              id="port"
              type="number"
              inputMode="numeric"
              aria-invalid={Boolean(errors.port)}
              {...form.register('port', { valueAsNumber: true })}
            />
          </Field>
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="accent-primary mt-0.5 size-4"
            {...form.register('secure')}
          />
          <span className="flex flex-col gap-0.5">
            <span className="font-medium">Conexão SSL/TLS direta</span>
            <span className="text-muted-foreground text-xs">
              Marque para a porta 465. Na 587 deixe desmarcado (usa STARTTLS).
            </span>
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Usuário" htmlFor="username">
            <Input
              id="username"
              autoComplete="off"
              {...form.register('username')}
            />
          </Field>
          <Field
            label="Senha"
            htmlFor="password"
            hint={
              settings.hasPassword
                ? 'Já existe uma senha salva. Deixe vazio para mantê-la.'
                : 'Guardada cifrada no banco.'
            }
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={settings.hasPassword ? '••••••••' : ''}
              disabled={clearPassword}
              {...form.register('password')}
            />
          </Field>
        </div>
        {settings.hasPassword && (
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="accent-primary size-4"
              {...form.register('clearPassword')}
            />
            Apagar a senha salva
          </label>
        )}
      </Section>

      <Section title="Mensagem">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Remetente"
            htmlFor="fromAddress"
            hint="Normalmente o mesmo e-mail do usuário. Aceita “Nome <email>”."
            error={errors.fromAddress?.message}
          >
            <Input
              id="fromAddress"
              placeholder="Site <contato@exemplo.com>"
              aria-invalid={Boolean(errors.fromAddress)}
              {...form.register('fromAddress')}
            />
          </Field>
          <Field
            label="Enviar para"
            htmlFor="toAddress"
            hint="Onde você quer receber. Responder o e-mail responde ao visitante."
            error={errors.toAddress?.message}
          >
            <Input
              id="toAddress"
              type="email"
              placeholder="voce@exemplo.com"
              aria-invalid={Boolean(errors.toAddress)}
              {...form.register('toAddress')}
            />
          </Field>
        </div>
      </Section>

      <SaveBar isDirty={isDirty} isPending={updateSettings.isPending}>
        <Button
          type="button"
          variant="outline"
          disabled={isDirty || sendTest.isPending}
          title={isDirty ? 'Salve antes de testar' : undefined}
          onClick={() =>
            sendTest.mutate(undefined, {
              onSuccess: ({ to }) =>
                toast.success(`E-mail de teste enviado para ${to}`),
              onError: (error) =>
                toast.error(`O teste falhou: ${errorMessage(error)}`),
            })
          }
        >
          <Send />
          {sendTest.isPending ? 'Enviando...' : 'Enviar teste'}
        </Button>
      </SaveBar>
    </form>
  )
}
