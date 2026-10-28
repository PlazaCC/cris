import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAbout } from '@/features/about/hooks/use-about'
import { useSubmitContact } from '@/features/contact/hooks/use-contact-mutations'
import { contactInputSchema } from '@/features/contact/schemas'
import { errorMessage } from '@/lib/error-message'
import { cn } from '@/lib/utils'

type ContactInput = z.infer<typeof contactInputSchema>

const emptyForm: ContactInput = {
  name: '',
  email: '',
  message: '',
  website: '',
}

const fieldClass =
  'w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-base text-dark-black outline-none transition-colors placeholder:text-black/35 focus:border-blue aria-invalid:border-red-500'

/*
 * "get in touch": o botão abre o formulário. A mensagem é salva no painel
 * antes de qualquer e-mail, então o sucesso aqui não depende do SMTP.
 */
export function ContactDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const submit = useSubmitContact()
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactInputSchema),
    defaultValues: emptyForm,
  })
  const { errors } = form.formState
  const { data: about } = useAbout()

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    // Depois de enviada, reabrir começa um formulário novo
    if (!next && submit.isSuccess) {
      submit.reset()
      form.reset(emptyForm)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="bg-off-white text-dark-black max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[32px] border-0 p-6 sm:max-w-xl sm:p-10"
      >
        <DialogClose
          className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10"
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </DialogClose>

        {submit.isSuccess ? (
          <div className="flex flex-col items-start gap-4 py-6" role="status">
            <span className="bg-blue flex size-12 items-center justify-center rounded-full text-white">
              <Check className="size-6" />
            </span>
            <DialogTitle className="text-4xl font-medium tracking-tight">
              Thanks, {form.getValues('name').split(' ')[0]}!
            </DialogTitle>
            <DialogDescription className="text-lg text-black/60">
              Your message is in. I'll get back to you soon.
            </DialogDescription>
            <DialogClose className="mt-2 rounded-full bg-black px-6 py-3 text-white hover:bg-black/85">
              Close
            </DialogClose>
          </div>
        ) : (
          <form
            noValidate
            className="flex flex-col gap-5"
            onSubmit={form.handleSubmit((values) => submit.mutate(values))}
          >
            <div className="flex flex-col gap-2 pr-10">
              <DialogTitle className="text-4xl font-medium tracking-tight">
                Let's talk
              </DialogTitle>
              <DialogDescription className="text-lg text-black/60">
                Tell me about your project, role or idea.
              </DialogDescription>
            </div>

            <ContactField label="Name" error={errors.name?.message}>
              <input
                className={fieldClass}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                {...form.register('name')}
              />
            </ContactField>
            <ContactField label="Email" error={errors.email?.message}>
              <input
                type="email"
                className={fieldClass}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                {...form.register('email')}
              />
            </ContactField>
            <ContactField label="Message" error={errors.message?.message}>
              <textarea
                rows={5}
                className={cn(fieldClass, 'resize-y')}
                aria-invalid={Boolean(errors.message)}
                {...form.register('message')}
              />
            </ContactField>

            {/* Honeypot: invisível para pessoas, robôs preenchem */}
            <div className="absolute -left-[9999px]" aria-hidden>
              <label>
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  {...form.register('website')}
                />
              </label>
            </div>

            {submit.isError && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage(submit.error)}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submit.isPending}
                className="flex items-center gap-2.5 rounded-full bg-black py-2 pr-2 pl-6 text-white hover:bg-black/85 disabled:opacity-60"
              >
                {submit.isPending ? 'Sending...' : 'Send message'}
                <span className="bg-blue flex size-8 items-center justify-center rounded-full">
                  <ArrowRight className="size-4" />
                </span>
              </button>
              {about?.email && (
                <p className="text-sm text-black/50">
                  or email{' '}
                  <a
                    href={`mailto:${about.email}`}
                    className="text-dark-black underline underline-offset-2"
                  >
                    {about.email}
                  </a>
                </p>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ContactField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </label>
  )
}
