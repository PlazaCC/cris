import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFooter } from '@/features/footer/hooks/use-footer'
import { useUpdateFooter } from '@/features/footer/hooks/use-update-footer'
import { footerInputSchema } from '@/features/footer/schemas'
import type { FooterData } from '@/interfaces'
import { errorMessage } from '@/lib/error-message'

import { Field, PageHeader, SaveBar, Section } from './components/field'
import { ListControls } from './components/list-controls'
import { QueryState } from './components/query-state'

type FooterInput = z.infer<typeof footerInputSchema>

export function AdminFooterPage() {
  const query = useFooter()

  return (
    <>
      <PageHeader title="Footer" description="Rodapé de todas as páginas." />
      <QueryState query={query}>
        {(footer) => <FooterForm footer={footer} />}
      </QueryState>
    </>
  )
}

function toInput(footer: FooterData): FooterInput {
  return { ...footer, colophon: footer.colophon ?? '' }
}

function FooterForm({ footer }: { footer: FooterData }) {
  const updateFooter = useUpdateFooter()
  const form = useForm<FooterInput>({
    resolver: zodResolver(footerInputSchema),
    defaultValues: toInput(footer),
  })
  const links = useFieldArray({ control: form.control, name: 'links' })
  const { errors, isDirty } = form.formState

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit((values) =>
        updateFooter.mutate(values, {
          onSuccess: (saved) => {
            form.reset(toInput(saved))
            toast.success('Footer salvo')
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      )}
    >
      <Section title="Textos">
        <Field label="Marca" htmlFor="brand" error={errors.brand?.message}>
          <Input
            id="brand"
            aria-invalid={Boolean(errors.brand)}
            {...form.register('brand')}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ano" htmlFor="year">
            <Input id="year" {...form.register('year')} />
          </Field>
          <Field label="Copyright" htmlFor="copyright">
            <Input id="copyright" {...form.register('copyright')} />
          </Field>
        </div>
        <Field label="Colofão" htmlFor="colophon" hint="Opcional.">
          <Input id="colophon" {...form.register('colophon')} />
        </Field>
      </Section>

      <Section title="Links">
        {links.fields.map((link, index) => (
          <div
            className="grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]"
            key={link.id}
          >
            <Field
              label="Título"
              htmlFor={`link-title-${index}`}
              error={errors.links?.[index]?.title?.message}
            >
              <Input
                id={`link-title-${index}`}
                {...form.register(`links.${index}.title`)}
              />
            </Field>
            <Field
              label="URL"
              htmlFor={`link-url-${index}`}
              error={errors.links?.[index]?.url?.message}
            >
              <Input
                id={`link-url-${index}`}
                {...form.register(`links.${index}.url`)}
              />
            </Field>
            <ListControls
              index={index}
              length={links.fields.length}
              label={`link ${index + 1}`}
              onMove={(to) => links.move(index, to)}
              onRemove={() => links.remove(index)}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => links.append({ title: '', url: '' })}
        >
          <Plus />
          Link
        </Button>
      </Section>

      <SaveBar isDirty={isDirty} isPending={updateFooter.isPending} />
    </form>
  )
}
