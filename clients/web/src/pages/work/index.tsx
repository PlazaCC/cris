import { useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState } from 'react'

import { ImagesBlock } from '@/components/blocks/images-block'
import { ParagraphsBlock } from '@/components/blocks/paragraphs-block'
import { QuoteTitle } from '@/components/blocks/quote-title'
import { ResultsBlock } from '@/components/blocks/results-block'
import { ScopeBlock } from '@/components/blocks/scope'
import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { projectRevealProps } from '@/components/page-transition/reveal'
import { useCoverEntering } from '@/components/page-transition/shared-cover-target'
import { useGlobal } from '@/features/global/hooks/use-global'
import { useProject } from '@/features/projects/hooks/use-project'
import { useProjects } from '@/features/projects/hooks/use-projects'
import type { ProjectBlock } from '@/interfaces'

import { NextProject } from './components/next-project'
import { ProjectHeader } from './components/project-header'

export function ProjectPage() {
  // A página continua montada durante a transição de saída, quando a rota
  // já não está ativa: o slug é o da montagem (cada projeto tem sua instância)
  const params = useParams({ from: '/_app/work/$slug', shouldThrow: false })
  const [slug] = useState(() => params?.slug ?? '')
  const { data: global } = useGlobal()
  const { data: project, isLoading, error, refetch } = useProject(slug)
  const { data: projects } = useProjects()
  // Vindo da home pela capa, os blocos entram depois do header
  const entering = useCoverEntering(slug)

  if (isLoading || error || !project) {
    return (
      <section className="flex min-h-dvh w-full items-center justify-center px-5">
        {isLoading && <LoadingState message="Carregando projeto..." />}
        {error && (
          <ErrorState
            title="Não foi possível carregar o projeto"
            onRetry={() => {
              void refetch()
            }}
          />
        )}
        {!isLoading && !error && !project && (
          <ErrorState title="Projeto não encontrado" />
        )}
      </section>
    )
  }

  const index = projects?.findIndex((item) => item.slug === project.slug) ?? -1
  const next =
    projects && projects.length > 1
      ? projects[(index + 1) % projects.length]
      : undefined

  return (
    <article className="flex flex-col items-center">
      <ProjectHeader siteName={global?.siteName ?? 'unk'} project={project} />
      <motion.div
        className="flex w-full flex-col items-center"
        {...projectRevealProps(entering, 0.3)}
      >
        {project.blocks.map(renderBlock)}
        {next && <NextProject slug={next.slug} title={next.title} />}
      </motion.div>
    </article>
  )
}

function renderBlock(block: ProjectBlock, index: number) {
  switch (block.type) {
    case 'scope':
      return (
        <ScopeBlock
          key={index}
          paragraphs={block.paragraphs}
          title={block.title}
        />
      )
    case 'quote-title':
      return <QuoteTitle key={index} text={block.text} />
    case 'paragraph':
      return <ParagraphsBlock items={block.items} key={index} />
    case 'images':
      return <ImagesBlock images={block.images} key={index} />
    default:
      return <ResultsBlock key={index} results={block.results} />
  }
}
