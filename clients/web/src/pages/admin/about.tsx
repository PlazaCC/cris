import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAbout } from '@/features/about/hooks/use-about'
import { useUpdateAbout } from '@/features/about/hooks/use-update-about'
import { aboutInputSchema } from '@/features/about/schemas'
import type { AboutData, AboutItem } from '@/interfaces'
import { errorMessage } from '@/lib/error-message'

import { Field, PageHeader, SaveBar, Section } from './components/field'
import { ResponsiveImageField } from './components/image-field'
import { QueryState } from './components/query-state'
import { StringListField } from './components/string-list-field'

type AboutInput = z.infer<typeof aboutInputSchema>

const toNames = (items: AboutItem[]) => items.map((item) => item.name)
const toItems = (names: string[]) => names.map((name) => ({ name }))

export function AdminAboutPage() {
  const query = useAbout()

  return (
    <>
      <PageHeader title="About" description="Conteúdo da página /about." />
      <QueryState query={query}>
        {(about) => <AboutForm about={about} />}
      </QueryState>
    </>
  )
}

function AboutForm({ about }: { about: AboutData }) {
  const updateAbout = useUpdateAbout()
  const form = useForm<AboutInput>({
    resolver: zodResolver(aboutInputSchema),
    defaultValues: about,
  })
  const { errors, isDirty } = form.formState
  const listError = (key: 'clients' | 'skills') =>
    errors[key] ? 'Preencha ou remova os itens vazios' : undefined

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit((values) =>
        updateAbout.mutate(values, {
          onSuccess: (saved) => {
            form.reset(saved)
            toast.success('About salvo')
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      )}
    >
      <Section title="Apresentação">
        <Field label="Título" htmlFor="title" error={errors.title?.message}>
          <Input
            id="title"
            aria-invalid={Boolean(errors.title)}
            {...form.register('title')}
          />
        </Field>
        <Field label="Texto" htmlFor="body">
          <Textarea id="body" className="min-h-40" {...form.register('body')} />
        </Field>
        <Field
          label="Email de contato"
          htmlFor="email"
          error={errors.email?.message}
          hint="Usado no botão “get in touch”."
        >
          <Input
            id="email"
            type="email"
            aria-invalid={Boolean(errors.email)}
            {...form.register('email')}
          />
        </Field>
        <Controller
          control={form.control}
          name="image"
          render={({ field }) => (
            <ResponsiveImageField
              label="Foto"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Section>

      <Section title="Clientes">
        <Field label="Clientes" error={listError('clients')}>
          <Controller
            control={form.control}
            name="clients"
            render={({ field }) => (
              <StringListField
                itemLabel="Cliente"
                addLabel="Cliente"
                value={toNames(field.value)}
                onChange={(names) => field.onChange(toItems(names))}
              />
            )}
          />
        </Field>
      </Section>

      <Section title="Skills">
        <Field label="Skills" error={listError('skills')}>
          <Controller
            control={form.control}
            name="skills"
            render={({ field }) => (
              <StringListField
                itemLabel="Skill"
                addLabel="Skill"
                value={toNames(field.value)}
                onChange={(names) => field.onChange(toItems(names))}
              />
            )}
          />
        </Field>
      </Section>

      <SaveBar isDirty={isDirty} isPending={updateAbout.isPending} />
    </form>
  )
}
