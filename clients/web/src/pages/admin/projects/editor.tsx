import { zodResolver } from '@hookform/resolvers/zod'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useBadges } from '@/features/badges/hooks/use-badges'
import { useProjectById } from '@/features/projects/hooks/use-project-by-id'
import {
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
} from '@/features/projects/hooks/use-project-mutations'
import { projectInputSchema } from '@/features/projects/schemas'
import type { Project } from '@/interfaces'
import { errorMessage } from '@/lib/error-message'
import { slugify } from '@/lib/slug'
import { cn } from '@/lib/utils'

import { BlockEditor } from '../components/block-editor'
import { Field, PageHeader, SaveBar, Section } from '../components/field'
import { ResponsiveImageField } from '../components/image-field'
import { QueryState } from '../components/query-state'

type ProjectInput = z.infer<typeof projectInputSchema>

const editRoute = getRouteApi('/admin/_panel/projects/$projectId')

const emptyProject: ProjectInput = {
  slug: '',
  title: '',
  description: '',
  year: String(new Date().getFullYear()),
  blurColor: '',
  coverImages: { desktop: '', mobile: '' },
  badges: [],
  blocks: [],
}

function toInput(project: Project): ProjectInput {
  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    year: project.year,
    blurColor: project.blurColor,
    coverImages: project.coverImages,
    badges: project.badges,
    blocks: project.blocks,
  }
}

export function AdminNewProjectPage() {
  return (
    <>
      <PageHeader title="Novo projeto" />
      <ProjectForm defaultValues={emptyProject} />
    </>
  )
}

export function AdminEditProjectPage() {
  const { projectId } = editRoute.useParams()
  const query = useProjectById(projectId)

  return (
    <>
      <PageHeader
        title={query.data?.title ?? 'Projeto'}
        actions={
          query.data && (
            <Button variant="outline" asChild>
              <a
                href={`/work/${query.data.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                Ver no site
              </a>
            </Button>
          )
        }
      />
      <QueryState query={query}>
        {(project) =>
          project ? (
            <ProjectForm
              key={project.documentId}
              id={project.documentId}
              defaultValues={toInput(project)}
            />
          ) : (
            <p className="bg-card text-muted-foreground rounded-xl border p-10 text-center text-sm">
              Projeto não encontrado.
            </p>
          )
        }
      </QueryState>
    </>
  )
}

type ProjectFormProps = {
  // sem id: criando um projeto novo
  id?: string
  defaultValues: ProjectInput
}

function ProjectForm({ id, defaultValues }: ProjectFormProps) {
  const router = useRouter()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues,
  })
  const { errors, isDirty, dirtyFields } = form.formState
  const isPending = createProject.isPending || updateProject.isPending

  const onSubmit = form.handleSubmit((values) => {
    if (id) {
      updateProject.mutate(
        { id, ...values },
        {
          onSuccess: () => {
            form.reset(values)
            toast.success('Projeto salvo')
          },
          onError: (error) => toast.error(errorMessage(error)),
        }
      )
      return
    }

    createProject.mutate(values, {
      onSuccess: (created) => {
        toast.success('Projeto criado')
        void router.navigate({
          to: '/admin/projects/$projectId',
          params: { projectId: created.id },
        })
      },
      onError: (error) => toast.error(errorMessage(error)),
    })
  })

  return (
    <form noValidate className="flex flex-col gap-6" onSubmit={onSubmit}>
      <Section title="Informações">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Título" htmlFor="title" error={errors.title?.message}>
            <Input
              id="title"
              aria-invalid={Boolean(errors.title)}
              {...form.register('title', {
                // Projeto novo: o slug acompanha o título até ser editado à mão
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                  if (!id && !dirtyFields.slug) {
                    form.setValue('slug', slugify(event.target.value))
                  }
                },
              })}
            />
          </Field>
          <Field
            label="Slug"
            htmlFor="slug"
            error={errors.slug?.message}
            hint="Endereço da página: /work/slug"
          >
            <Input
              id="slug"
              aria-invalid={Boolean(errors.slug)}
              {...form.register('slug')}
            />
          </Field>
          <Field label="Ano" htmlFor="year">
            <Input id="year" inputMode="numeric" {...form.register('year')} />
          </Field>
          <Field
            label="Cor do blur"
            htmlFor="blurColor"
            hint="Guardada no projeto; hoje o site não a exibe."
          >
            <Input id="blurColor" {...form.register('blurColor')} />
          </Field>
        </div>
        <Field label="Descrição" htmlFor="description">
          <Textarea id="description" {...form.register('description')} />
        </Field>
      </Section>

      <Section title="Capa">
        <Controller
          control={form.control}
          name="coverImages"
          render={({ field }) => (
            <ResponsiveImageField
              label="Capa"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Section>

      <Section
        title="Role"
        description="Clique para marcar; a ordem é a dos cliques."
      >
        <Controller
          control={form.control}
          name="badges"
          render={({ field }) => (
            <BadgePicker value={field.value} onChange={field.onChange} />
          )}
        />
      </Section>

      <Section
        title="Blocos"
        description="O conteúdo da página, de cima para baixo."
      >
        <Controller
          control={form.control}
          name="blocks"
          render={({ field }) => (
            <BlockEditor value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.blocks && (
          <p className="text-destructive text-xs">
            Algum bloco tem dados inválidos.
          </p>
        )}
      </Section>

      <SaveBar
        isDirty={isDirty}
        isPending={isPending}
        label={id ? 'Salvar' : 'Criar projeto'}
      >
        {id && (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            disabled={deleteProject.isPending}
            onClick={() => {
              if (
                !window.confirm('Apagar este projeto? Não dá para desfazer.')
              ) {
                return
              }
              deleteProject.mutate(id, {
                onSuccess: () => {
                  toast.success('Projeto apagado')
                  void router.navigate({ to: '/admin/projects' })
                },
                onError: (error) => toast.error(errorMessage(error)),
              })
            }}
          >
            <Trash2 />
            Apagar
          </Button>
        )}
      </SaveBar>
    </form>
  )
}

function BadgePicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) {
  const { data: badges, isLoading } = useBadges()

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Carregando badges...</p>
  }

  if (!badges?.length) {
    return (
      <p className="text-muted-foreground text-sm">
        Nenhum badge cadastrado. Crie em Badges.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const position = value.indexOf(badge.name)
        const active = position >= 0

        return (
          <button
            key={badge.documentId}
            type="button"
            aria-pressed={active}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors',
              active
                ? 'bg-blue border-blue text-white'
                : 'hover:bg-muted bg-background'
            )}
            onClick={() =>
              onChange(
                active
                  ? value.filter((name) => name !== badge.name)
                  : [...value, badge.name]
              )
            }
          >
            {active && (
              <span className="text-[10px] font-semibold opacity-80">
                {position + 1}
              </span>
            )}
            {badge.name}
          </button>
        )
      })}
    </div>
  )
}
