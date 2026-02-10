import { cn } from '@/lib/utils'
import { createRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { create } from 'zustand'
import { AppLayout } from '../_layout'

HomePage.route = createRoute({
  path: '/',
  component: HomePage,
  getParentRoute: () => AppLayout.route,
})

export function HomePage() {
  return (
    <>
      <div className="m-auto flex w-full max-w-[1920px] flex-col items-center justify-center">
        <HomeHero />
        <Projects />
      </div>
    </>
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

type ProjectsCarouselState = {
  activeIndex: number
  total: number
  setTotal: (total: number) => void
  goTo: (index: number) => void
  next: () => void
  prev: () => void
}

export const useProjectsCarouselStore = create<ProjectsCarouselState>(
  (set, get) => ({
    activeIndex: 0,
    total: 0,
    setTotal: (total) => set({ total }),
    goTo: (index) => {
      const { total } = get()
      if (total === 0) return
      const normalized = ((index % total) + total) % total
      set({ activeIndex: normalized })
    },
    next: () => {
      const { activeIndex, total } = get()
      if (total === 0) return
      set({ activeIndex: (activeIndex + 1) % total })
    },
    prev: () => {
      const { activeIndex, total } = get()
      if (total === 0) return
      set({ activeIndex: (activeIndex - 1 + total) % total })
    },
  })
)

export const Projects = () => {
  const { activeIndex, goTo, setTotal } = useProjectsCarouselStore()

  const projects = [
    { id: 1, image: './images/project-1.png' },
    { id: 2, image: './images/project-2.png' },
    { id: 3, image: './images/project-1.png' },
  ]
  const backgroundImages = projects.map((project) => project.image)

  // inicializa o total na store
  useEffect(() => {
    setTotal(projects.length)
  }, [projects.length, setTotal])

  return (
    <section className="h-dvh w-full max-w-[1920px] px-10 pt-9 pb-[93px]">
      <div className="relative h-full w-full">
        <ProjectsBackground
          images={backgroundImages}
          activeIndex={activeIndex}
        />
        <div className="h-full w-full overflow-hidden rounded-4xl">
          <motion.div
            className="relative h-full w-full"
            animate={{ y: `-${activeIndex * 100}%` }}
            transition={{
              duration: 1.2,
              ease: [0.8, 0, 0.2, 1],
            }}
          >
            {projects.map((project) => (
              <div key={project.id} className="h-full w-full overflow-hidden">
                <ProjectCard image={project.image} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* pagination */}
        <ul className="absolute top-1/2 right-5 z-1 flex -translate-y-1/2 flex-col gap-7 rounded-full bg-black/40 px-1 py-3">
          {projects.map((project, index) => (
            <li key={project.id}>
              <button
                className={cn(
                  'flex h-2 w-2 items-center justify-center',
                  'cursor-pointer transition-all duration-300 hover:[&_div]:h-1.5 hover:[&_div]:w-1.5'
                )}
                onClick={() => goTo(index)}
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
      </div>
    </section>
  )
}

type ProjectsBackgroundProps = {
  images: string[]
  activeIndex: number
}

const ProjectsBackground = ({
  images,
  activeIndex,
}: ProjectsBackgroundProps) => {
  return (
    <div className="absolute top-0 left-0 h-full w-full rounded-4xl blur-[39px]">
      {images.map((image, index) => (
        <motion.img
          key={`${image}-${index}`}
          className="absolute top-0 left-0 h-full w-full object-cover"
          src={image}
          initial={false}
          animate={{ opacity: activeIndex === index ? 0.75 : 0 }}
          transition={{ duration: 1.2, ease: [0.66, 0, 0.5, 1] }}
        />
      ))}
    </div>
  )
}

type ProjectCardProps = {
  image: string
}

export const ProjectCard = ({ image }: ProjectCardProps) => {
  return (
    <div className="relative h-full w-full">
      <div className="relative h-full w-full overflow-hidden">
        <img className="h-full w-full object-cover" src={image} />
      </div>
    </div>
  )
}
