import { createRoute } from '@tanstack/react-router'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { forwardRef, useEffect, useRef, useState } from 'react'

import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { ResponsiveImageView } from '@/components/ui/responsive-image'

import { useGlobal } from '@/features/global/hooks/use-global'
import { useHero } from '@/features/hero/hooks/use-hero'
import { useProjects } from '@/features/projects/hooks/use-projects'

import type { Project, ResponsiveImage } from '@/interrfaces'

import { cn } from '@/lib/utils'

import { locomotiveScroll } from '@/main'
import { AppLayout } from '../_layout'

HomePage.route = createRoute({
  path: '/',
  component: HomePage,
  getParentRoute: () => AppLayout.route,
})

export function HomePage() {
  return (
    <div className="m-auto flex w-full max-w-[1920px] flex-col items-center justify-center overflow-visible">
      <HeroSection />
      <ProjectsSection />
    </div>
  )
}

function HeroSection() {
  const {
    data: global,
    isLoading: isGlobalLoading,
    error: globalError,
    refetch: refetchGlobal,
  } = useGlobal()
  const {
    data: hero,
    isLoading: isHeroLoading,
    error: heroError,
    refetch: refetchHero,
  } = useHero()

  const isLoading = isGlobalLoading || isHeroLoading
  const error = globalError || heroError
  const hasData = Boolean(global && hero)

  // Mantém estrutura visual mesmo com erro/loading
  if (isLoading || error || !hasData) {
    return (
      <div className="h-dvh w-full px-10 pt-9 pb-[115px]">
        <div className="bg-off-white relative flex h-full w-full flex-col items-center justify-center rounded-4xl p-[53px] shadow-2xl">
          {isLoading && <LoadingState message="Carregando..." />}
          {error && (
            <ErrorState
              title="Não foi possível carregar o conteúdo"
              message="Verifique se o Strapi está ativo e tente novamente."
              onRetry={() => {
                void refetchGlobal()
                void refetchHero()
              }}
            />
          )}
          {!isLoading && !error && !hasData && (
            <ErrorState title="Conteúdo não encontrado" />
          )}
        </div>
      </div>
    )
  }

  if (!global || !hero) {
    return null
  }

  const resolvedGlobal = global
  const resolvedHero = hero

  return (
    <HomeHero
      siteName={resolvedGlobal.siteName}
      highlight={resolvedHero.highlight}
      title={resolvedHero.title}
      subtitle={resolvedHero.subtitle}
      name={resolvedHero.name}
      description={resolvedHero.description}
      image={resolvedHero.image}
    />
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
              message="Verifique se o Strapi está ativo e tente novamente."
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

export const HomeHero = ({
  siteName,
  highlight,
  title,
  subtitle,
  name,
  description,
  image,
}: {
  siteName: string
  highlight: string
  title: string
  subtitle: string
  name: string
  description: string
  image?: ResponsiveImage
}) => {
  const [descriptionLine1 = '', descriptionLine2 = ''] = description.split('\n')

  return (
    <div className="h-dvh w-full px-10 pt-9 pb-[115px]">
      <div className="bg-off-white relative flex h-full w-full flex-col justify-between rounded-4xl p-[53px] pb-[95px] shadow-2xl">
        <div className="absolute top-0 left-0 z-1 h-full w-full">
          {image?.desktop || image?.mobile ? (
            <ResponsiveImageView
              alt={siteName}
              fetchPriority="high"
              image={image}
              imgClassName="h-full w-full object-contain"
              loading="eager"
            />
          ) : null}
        </div>
        <span className="relative text-[32px] leading-[100%] font-bold text-black">
          {siteName}
        </span>
        <div className="relative z-1 flex flex-col gap-16">
          <h1 className="text-[88px] leading-[98%]">
            <span className="after:bg-blue relative z-10 after:absolute after:bottom-[10px] after:left-0 after:-z-10 after:h-[8px] after:w-full after:content-['']">
              {highlight}
            </span>{' '}
            {title} <br />
            {subtitle}
          </h1>
          <p className="text-lg">
            Hi, I'm <span className="text-blue">{name}</span>,{' '}
            {descriptionLine1}
            <br />
            {descriptionLine2}
          </p>
        </div>
      </div>
    </div>
  )
}

export const Projects = ({ projects }: { projects: Project[] }) => {
  const sectionRef = useRef<HTMLElement>(null)
  const isSectionInView = useInView(sectionRef, { amount: 0.25 })
  const [activeIndex, setActiveIndex] = useState(0)
  const projectRefs = useRef<(HTMLDivElement | null)[]>([])

  const scrollTo = (index: number) => {
    const ref = projectRefs.current[index]
    if (!ref) return

    const height = ref.getBoundingClientRect().height

    const offset = -(window.innerHeight - height) / 2

    locomotiveScroll.scrollTo(ref, {
      offset,
    })
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="relative w-full max-w-[1920px] px-10"
      >
        <ul className="relative flex flex-col gap-9">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.documentId || project.slug || index}
              ref={(el) => {
                projectRefs.current[index] = el
              }}
              title={project.title}
              badges={project.badges}
              image={project.coverImages}
              onInView={() => setActiveIndex(index)}
              isLast={index === projects.length - 1}
            />
          ))}
        </ul>
      </section>

      {/* Paginação fixa no meio da tela */}
      <Pagination
        isVisible={isSectionInView}
        activeIndex={activeIndex}
        total={projects.length}
        onNavigate={scrollTo}
      />
    </>
  )
}

type ProjectCardProps = {
  title: string
  badges: string[]
  image: Project['coverImages']
  onInView: () => void
  isLast?: boolean
}

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ image, title, badges, onInView, isLast }, ref) => {
    const sentinelRef = useRef<HTMLDivElement>(null)
    const stickyStartY = useRef<number | null>(null)
    const { scrollY } = useScroll()

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

    const animationRange = window.innerHeight

    const filter = useTransform(scrollY, (latest) => {
      if (isLast || stickyStartY.current === null) return 'blur(0px)'
      const t = Math.max(0, Math.min(1, (latest - stickyStartY.current) / animationRange))
      const blurAmount = Math.max(0, (t - 0.3) / 0.7) * 10
      return `blur(${blurAmount}px)`
    })

    const scale = useTransform(scrollY, (latest) => {
      if (isLast || stickyStartY.current === null) return 1
      const t = Math.max(0, Math.min(1, (latest - stickyStartY.current) / animationRange))
      return 1 - Math.max(0, (t - 0.3) / 0.7) * 0.12
    })

    return (
      <>
        {/* sentinel: 1px antes do sticky — quando sai pelo topo, o card grudou */}
        <div ref={sentinelRef} className="pointer-events-none h-px" aria-hidden />
        <div className="sticky top-0 pt-[35px]">
          <motion.div
            ref={ref}
            className="mb-[93px] h-[80vh] w-full overflow-hidden rounded-4xl"
            style={{ filter, scale }}
          >
            <ResponsiveImageView
              alt={title}
              image={image}
              imgClassName="h-full w-full object-cover"
            />

            <div className="absolute bottom-[30px] left-[35px] flex w-full max-w-[360px] flex-col gap-4 rounded-2xl bg-white px-8 py-4">
              <h2 className="text-[32px]">{title}</h2>
              <ul className="flex gap-2">
                {badges.map((badge) => (
                  <li
                    className="bg-blue rounded-full px-4 py-1 text-xs text-white"
                    key={badge}
                  >
                    {badge}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </>
    )
  }
)

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
        'fixed top-1/2 z-50 flex w-full max-w-[1920px] -translate-y-1/2 justify-end pr-15'
      )}
      initial={{ opacity: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
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
