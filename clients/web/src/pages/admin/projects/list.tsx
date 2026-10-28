import { Link } from '@tanstack/react-router'
import { ExternalLink, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useProjects } from '@/features/projects/hooks/use-projects'

import { PageHeader } from '../components/field'
import { QueryState } from '../components/query-state'

export function AdminProjectsPage() {
  const query = useProjects()

  return (
    <>
      <PageHeader
        title="Projetos"
        description="Na mesma ordem da home: ano mais recente primeiro."
        actions={
          <Button asChild>
            <Link to="/admin/projects/new">
              <Plus />
              Novo projeto
            </Link>
          </Button>
        }
      />
      <QueryState query={query}>
        {(projects) =>
          projects.length === 0 ? (
            <p className="bg-card text-muted-foreground rounded-xl border p-10 text-center text-sm">
              Nenhum projeto ainda.
            </p>
          ) : (
            <ul className="bg-card divide-y rounded-xl border">
              {projects.map((project) => (
                <li
                  className="flex items-center gap-4 p-3"
                  key={project.documentId}
                >
                  <div className="bg-muted size-14 shrink-0 overflow-hidden rounded-md">
                    {(project.coverImages.mobile ||
                      project.coverImages.desktop) && (
                      <img
                        src={
                          project.coverImages.mobile ||
                          project.coverImages.desktop
                        }
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <Link
                    to="/admin/projects/$projectId"
                    params={{ projectId: project.documentId }}
                    className="flex min-w-0 flex-1 flex-col hover:underline"
                  >
                    <span className="truncate font-medium">
                      {project.title}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {project.year} · /work/{project.slug} ·{' '}
                      {project.blocks.length} blocos
                    </span>
                  </Link>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={`/work/${project.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Ver ${project.title} no site`}
                    >
                      <ExternalLink />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
    </>
  )
}
