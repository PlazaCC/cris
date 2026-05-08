import { ImagesBlock } from '@/components/blocks/images-block'
import { ParagraphsBlock } from '@/components/blocks/paragraphs-block'
import { ProjectProgressionBlock } from '@/components/blocks/projetct-progression'
import { QuoteTitle } from '@/components/blocks/quote-title'
import { ResultsBlock } from '@/components/blocks/results-block'
import { ScopeBlock } from '@/components/blocks/scope'
import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { useProjects } from '@/features/projects/hooks/use-projects'
import type { ProjectBlock } from '@/interfaces'
import { createRoute } from '@tanstack/react-router'
import { AppLayout } from '../_layout'

WorkPage.route = createRoute({
  path: '/work',
  component: WorkPage,
  getParentRoute: () => AppLayout.route,
})

export function WorkPage() {
  const { data: projects, isLoading, error, refetch } = useProjects()

  if (isLoading) {
    return <LoadingState message="Carregando projeto..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Não foi possível carregar o projeto"
        message="Verifique se o Strapi está ativo e tente novamente."
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  const project = projects?.[0]

  if (!project) {
    return <ErrorState title="Nenhum projeto encontrado" />
  }

  const renderBlock = (block: ProjectBlock, index: number) => {
    if (block.type === 'scope') {
      return (
        <ScopeBlock
          key={index}
          paragraphs={block.paragraphs}
          title={block.title}
        />
      )
    }

    if (block.type === 'quote-title') {
      return <QuoteTitle key={index} text={block.text} />
    }

    if (block.type === 'paragraph') {
      return <ParagraphsBlock items={block.items} key={index} />
    }

    if (block.type === 'images') {
      return <ImagesBlock images={block.images} key={index} />
    }

    return <ResultsBlock key={index} results={block.results} />
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <h1 className="mt-8 text-4xl font-bold">{project.title}</h1>
        <p className="text-dark-black mt-3 max-w-[920px] text-center text-lg">
          {project.description}
        </p>
        {project.blocks.map(renderBlock)}
        <ProjectProgressionBlock />
      </div>
    </>
  )
}
