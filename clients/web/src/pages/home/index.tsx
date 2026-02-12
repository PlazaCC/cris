import { cn } from '@/lib/utils'
import { locomotiveScroll } from '@/main'
import { createRoute } from '@tanstack/react-router'
import { motion, useInView } from 'framer-motion'
import { forwardRef, useRef, useState } from 'react'
import { AppLayout } from '../_layout'

HomePage.route = createRoute({
  path: '/',
  component: HomePage,
  getParentRoute: () => AppLayout.route,
})

export function HomePage() {
  return (
    <div className="m-auto flex w-full max-w-[1920px] flex-col items-center justify-center overflow-visible">
      <HomeHero />
      <Projects />
    </div>
  )
}

export const HomeHero = () => {
  return (
    <div className="h-dvh w-full px-10 pt-9 pb-[115px]">
      <div className="bg-off-white relative flex h-full w-full flex-col justify-between rounded-4xl p-[53px] pb-[95px] shadow-2xl">
        <div className="absolute top-0 left-0 z-1 h-full w-full">
          <img
            className="h-full w-full object-contain"
            src="./images/header-1.png"
          />
        </div>
        <span className="relative text-[32px] leading-[100%] font-bold text-black">
          unk
        </span>
        <div className="relative z-1 flex flex-col gap-16">
          <h1 className="text-[88px] leading-[98%]">
            <span className="after:bg-blue relative z-10 after:absolute after:bottom-[10px] after:left-0 after:-z-10 after:h-[8px] after:w-full after:content-['']">
              Polymath
            </span>{' '}
            designer, in a <br />
            relationship with interactivity
          </h1>
          <p className="text-lg">
            Hi, I'm <span className="text-blue">Cris</span>, a multidisciplinary
            designer who combines different design approaches to
            <br />
            solve my clients' needs.
          </p>
        </div>
      </div>
    </div>
  )
}

const projects = [
  { id: 1, image: './images/project-1.png' },
  { id: 2, image: './images/project-2.png' },
  { id: 3, image: './images/project-1.png' },
]

export const Projects = () => {
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
        className="relative w-full max-w-[1920px] px-10 pb-[93px]"
      >
        <div className="flex flex-col gap-9">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              ref={(el) => {
                projectRefs.current[index] = el
              }}
              image={project.image}
              onInView={() => setActiveIndex(index)}
            />
          ))}
        </div>
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
  image: string
  onInView: () => void
}

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ image, onInView }, ref) => {
    return (
      <motion.div
        ref={ref}
        className="relative h-[80vh] w-full overflow-hidden rounded-4xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.1 }}
        onViewportEnter={() => {
          onInView()
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <img className="h-full w-full object-cover" src={image} />

        <div className="absolute bottom-[30px] left-[35px] flex w-full max-w-[360px] flex-col gap-4 rounded-2xl bg-white px-8 py-4">
          <h2 className="text-[32px]">Lovesicky</h2>
          <ul className="flex gap-2">
            <li className="bg-blue rounded-full px-4 py-1 text-xs text-white">
              art direction
            </li>
            <li className="bg-blue rounded-full px-4 py-1 text-xs text-white">
              3D
            </li>
            <li className="bg-blue rounded-full px-4 py-1 text-xs text-white">
              branding
            </li>
          </ul>
        </div>
      </motion.div>
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
