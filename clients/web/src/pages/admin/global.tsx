import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useGlobal } from '@/features/global/hooks/use-global'
import { useUpdateGlobal } from '@/features/global/hooks/use-update-global'
import { globalInputSchema } from '@/features/global/schemas'
import type { GlobalData } from '@/interfaces'
import { errorMessage } from '@/lib/error-message'

import { Field, PageHeader, SaveBar, Section } from './components/field'
import { ImageField } from './components/image-field'
import { QueryState } from './components/query-state'

type GlobalInput = z.infer<typeof globalInputSchema>

export function AdminGlobalPage() {
  const query = useGlobal()

  return (
    <>
      <PageHeader
        title="Global"
        description="Nome do site, favicon e SEO padrão das páginas."
      />
      <QueryState query={query}>
        {(global) => <GlobalForm global={global} />}
      </QueryState>
    </>
  )
}

function GlobalForm({ global }: { global: GlobalData }) {
  const updateGlobal = useUpdateGlobal()
  const form = useForm<GlobalInput>({
    resolver: zodResolver(globalInputSchema),
    defaultValues: global,
  })
  const { errors, isDirty } = form.formState

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit((values) =>
        updateGlobal.mutate(values, {
          onSuccess: (saved) => {
            form.reset(saved)
            toast.success('Global salvo')
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      )}
    >
      <Section title="Site">
        <Field
          label="Nome do site"
          htmlFor="siteName"
          error={errors.siteName?.message}
        >
          <Input
            id="siteName"
            aria-invalid={Boolean(errors.siteName)}
            {...form.register('siteName')}
          />
        </Field>
        <Field label="Descrição" htmlFor="siteDescription">
          <Textarea
            id="siteDescription"
            {...form.register('siteDescription')}
          />
        </Field>
        <Controller
          control={form.control}
          name="favicon"
          render={({ field }) => (
            <ImageField
              label="Favicon"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Section>

      <Section
        title="SEO padrão"
        description="Usado no título da aba e quando o link é compartilhado."
      >
        <Field label="Meta title" htmlFor="metaTitle">
          <Input id="metaTitle" {...form.register('defaultSeo.metaTitle')} />
        </Field>
        <Field label="Meta description" htmlFor="metaDescription">
          <Textarea
            id="metaDescription"
            {...form.register('defaultSeo.metaDescription')}
          />
        </Field>
        <Controller
          control={form.control}
          name="defaultSeo.shareImage"
          render={({ field }) => (
            <ImageField
              label="Imagem de compartilhamento"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Section>

      <SaveBar isDirty={isDirty} isPending={updateGlobal.isPending} />
    </form>
  )
}
