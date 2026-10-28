import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FieldProps = {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  className?: string
  children: React.ReactNode
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs">{error}</p>
      ) : (
        hint && <p className="text-muted-foreground text-xs">{hint}</p>
      )}
    </div>
  )
}

type SectionProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function Section({
  title,
  description,
  actions,
  children,
}: SectionProps) {
  return (
    <section className="bg-card flex flex-col gap-5 rounded-xl border p-5 md:p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}

type PageHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}

type SaveBarProps = {
  isDirty: boolean
  isPending: boolean
  label?: string
  children?: React.ReactNode
}

// Fica grudada no rodapé enquanto o formulário rola
export function SaveBar({
  isDirty,
  isPending,
  label = 'Salvar',
  children,
}: SaveBarProps) {
  return (
    <div className="bg-background/95 sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <span className="text-muted-foreground mr-auto text-sm">
        {isDirty ? 'Alterações não salvas' : 'Tudo salvo'}
      </span>
      {children}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : label}
      </Button>
    </div>
  )
}
