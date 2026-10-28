import { Link } from '@tanstack/react-router'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { revealItem } from '@/components/page-transition/reveal'
import {
  beginCoverTransition,
  COVER_TIMING,
  coverContentOut,
} from '@/components/page-transition/shared-cover-target'
import { ResponsiveImageView } from '@/components/ui/responsive-image'

import { useGlobal } from '@/features/global/hooks/use-global'
import { useProjects } from '@/features/projects/hooks/use-projects'

import type { Project } from '@/interfaces'

import { getSmoothScroll } from '@/lib/smooth-scroll'
import { cn } from '@/lib/utils'
import { usePageTransitionStore } from '@/stores/page-transition-store'

import { HomeHero } from '@/pages/home/components/hero'

export function HomePage() {
  return (
    <div className="m-auto flex w-full max-w-[1920px] flex-col items-center justify-center overflow-visible">
      <HeroSection />
      <ProjectsSection />
    </div>
  )
}

function HeroSection() {
  // A hero é conteúdo fixo; só o nome do site vem do banco, sem bloquear a renderização
  const { data: global } = useGlobal()
  const leaving = usePageTransitionStore((s) => s.cover !== null)

  return (
    <motion.div
      className="w-full"
      {...(leaving ? coverContentOut(true) : { variants: revealItem })}
    >
      <HomeHero siteName={global?.siteName || 'Cris'} />
    </motion.div>
  )
}

function ProjectsSection() {
  const { data: projects, isLoading, error, refetch } = useProjects()

  // Mantém estrutura visual mesmo com erro/loading
  if (isLoading || error || !projects || projects.length === 0) {
    return (
      <section className="relative w-full max-w-[1920px] px-10 py-20">
        <div className="flex min-h-[50vh] items-center justify-center">
          {isLoading && <LoadingState message="Carregando projetos..." />}
          {error && (
            <ErrorState
              title="Não foi possível carregar os projetos"
              message="Verifique sua conexão e tente novamente."
              onRetry={() => {
                void refetch()
              }}
            />
          )}
          {!isLoading && !error && (!projects || projects.length === 0) && (
            <ErrorState title="Nenhum projeto publicado" />
          )}
        </div>
      </section>
    )
  }

  return <Projects projects={projects} />
}

export const Projects = ({ projects }: { projects: Project[] }) => {
  const sectionRef = useRef<HTMLElement>(null)
  const isSectionInView = useInView(sectionRef, { amount: 0.25 })
  const [activeIndex, setActiveIndex] = useState(0)
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([])
  const { scrollY } = useScroll()
  // Slug do card clicado enquanto a capa dele voa para o projeto
  const leavingSlug = usePageTransitionStore((s) => s.cover?.slug ?? null)
  const coverLaunched = usePageTransitionStore((s) => s.launched)

  // Posição de scroll em que o card gruda. Mede o sentinel, que segue no
  // fluxo: o card sticky reporta onde está grudado, não onde fica na página
  const stickPoint = (index: number) => {
    const sentinel = sentinelRefs.current[index]
    if (!sentinel) return 0
    return sentinel.getBoundingClientRect().top + window.scrollY + 1
  }

  // Ativo é o último card que já cobriu o meio da tela, nos dois sentidos
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const threshold = latest + window.innerHeight / 2
    let next = 0
    projects.forEach((_, index) => {
      if (stickPoint(index) <= threshold) next = index
    })
    setActiveIndex(next)
  })

  const scrollTo = (index: number) => {
    getSmoothScroll()?.scrollTo(stickPoint(index))
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full max-w-[1920px] px-5 md:px-10"
      >
        <ul className="relative flex flex-col gap-9">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.documentId || project.slug || index}
              sentinelRef={(el) => {
                sentinelRefs.current[index] = el
              }}
              title={project.title}
              slug={project.slug}
              badges={project.badges}
              image={project.coverImages}
              isLast={index === projects.length - 1}
              leaving={leavingSlug !== null}
              isSource={leavingSlug === project.slug}
              detached={leavingSlug === project.slug && coverLaunched}
            />
          ))}
        </ul>
      </section>

      {/* Paginação fixa no meio da tela */}
      <Pagination
        isVisible={isSectionInView && leavingSlug === null}
        activeIndex={activeIndex}
        total={projects.length}
        onNavigate={scrollTo}
      />
    </>
  )
}

type ProjectCardProps = {
  title: string
  slug: string
  badges: string[]
  image: Project['coverImages']
  sentinelRef: (el: HTMLDivElement | null) => void
  isLast?: boolean
  // Saindo para um projeto: o card clicado perde só o painel (a imagem vira a
  // capa que voa) e os demais somem junto com o resto da página
  leaving: boolean
  isSource: boolean
  // A capa já voa no overlay: o card de origem some para não ficar duplicado
  detached: boolean
}

const ProjectCard = ({
  image,
  title,
  slug,
  badges,
  sentinelRef: registerSentinel,
  isLast,
  leaving,
  isSource,
  detached,
}: ProjectCardProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const stickyStartY = useRef<number | null>(null)
  const { scrollY } = useScroll()
  // 0 → efeito de empilhamento do scroll; 1 → card nítido e em escala cheia.
  // O card clicado volta para frente enquanto o resto da página sai, para a
  // capa partir de uma imagem igual à que vai voar
  const release = useMotionValue(0)

  useEffect(() => {
    if (!isSource) return
    const controls = animate(release, 1, {
      duration: COVER_TIMING.contentOut,
      ease: [0.4, 0, 0.2, 1],
    })
    return () => controls.stop()
  }, [isSource, release])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          // sentinel saiu pelo topo → card acabou de grudar
          stickyStartY.current = scrollY.get()
        } else if (entry.isIntersecting) {
          // sentinel voltou → card não está mais sticky
          stickyStartY.current = null
        }
      },
      { threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [scrollY])

  const filter = useTransform(
    [scrollY, release],
    ([latest, released]: number[]) => {
      if (isLast || stickyStartY.current === null) return 'blur(0px)'
      const t = Math.max(
        0,
        Math.min(1, (latest - stickyStartY.current) / window.innerHeight)
      )
      const blurAmount = Math.max(0, (t - 0.3) / 0.7) * 10 * (1 - released)
      return `blur(${blurAmount}px)`
    }
  )

  const scale = useTransform(
    [scrollY, release],
    ([latest, released]: number[]) => {
      if (isLast || stickyStartY.current === null) return 1
      const t = Math.max(
        0,
        Math.min(1, (latest - stickyStartY.current) / window.innerHeight)
      )
      return 1 - Math.max(0, (t - 0.3) / 0.7) * 0.12 * (1 - released)
    }
  )

  return (
    <>
      {/* sentinel: 1px antes do sticky — quando sai pelo topo, o card grudou.
          -mb-9 anula o gap-9 da lista para ficar colado ao sticky */}
      <div
        ref={(el) => {
          sentinelRef.current = el
          registerSentinel(el)
        }}
        className="pointer-events-none -mb-9 h-px"
        aria-hidden
      />
      <div className="sticky top-0 pt-[35px]">
        <motion.div
          className={cn(
            'relative mb-[93px] h-[80vh] w-full overflow-hidden rounded-4xl',
            detached && 'invisible'
          )}
          style={{ filter, scale }}
          {...coverContentOut(leaving && !isSource)}
        >
          <ResponsiveImageView
            alt={title}
            image={image}
            imgClassName="h-full w-full object-cover"
          />

          {/* O card inteiro abre o projeto */}
          <Link
            to="/work/$slug"
            params={{ slug }}
            // A página antiga fica na tela até a capa pousar: quem volta ao
            // topo é o AnimatedOutlet quando a página nova monta
            resetScroll={false}
            aria-label={title}
            className="absolute inset-0 z-10"
            // A moldura do card é o ponto de partida da capa que voa para o projeto
            onClick={(event) =>
              beginCoverTransition(
                event,
                event.currentTarget.parentElement,
                slug
              )
            }
          />

          <motion.div
            className="absolute inset-x-2.5 bottom-2.5 flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 md:inset-x-auto md:bottom-[30px] md:left-[35px] md:w-full md:max-w-[360px] md:gap-4 md:px-8"
            {...coverContentOut(isSource)}
          >
            <h2 className="text-2xl md:text-[32px]">{title}</h2>
            {/* Badges quebram de linha inteiras: no mobile não cabem lado a lado */}
            <ul className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <li
                  className="bg-blue rounded-full px-3 py-1 text-xs whitespace-nowrap text-white md:px-4"
                  key={badge}
                >
                  {badge}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

type PaginationProps = {
  isVisible: boolean
  activeIndex: number
  total: number
  onNavigate: (index: number) => void
}

const Pagination = ({
  isVisible,
  activeIndex,
  total,
  onNavigate,
}: PaginationProps) => {
  return (
    <motion.div
      className={cn(
        'pointer-events-none fixed top-1/2 z-50 flex w-full max-w-[1920px] -translate-y-1/2 justify-end pr-[22px] md:pr-15'
      )}
      initial={{ opacity: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <ul
        className={cn(
          'flex flex-col gap-7 rounded-full bg-black/40 px-1 py-3',
          isVisible ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {Array.from({ length: total }).map((_, index) => (
          <li key={index}>
            <button
              className={cn(
                'flex h-2 w-2 items-center justify-center',
                'cursor-pointer transition-all duration-300 hover:[&_div]:h-1.5 hover:[&_div]:w-1.5'
              )}
              onClick={() => onNavigate(index)}
            >
              <div
                className={cn(
                  'h-1 w-1 rounded-full bg-white transition-all',
                  activeIndex === index && 'h-1.5 w-1.5'
                )}
              />
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
