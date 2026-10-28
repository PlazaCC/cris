import { Link, useCanGoBack, useRouter } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import backIcon from '@/assets/icons/arrow-left-circle.svg'
import {
  ProjectCoverFrame,
  projectHeaderClassName,
} from '@/components/page-transition/project-cover-frame'
import {
  projectRevealProps,
  revealItem,
} from '@/components/page-transition/reveal'
import { useSharedCoverTarget } from '@/components/page-transition/shared-cover-target'
import { ResponsiveImageView } from '@/components/ui/responsive-image'
import type { Project } from '@/interfaces'

type ProjectHeaderProps = {
  siteName: string
  project: Project
}

/*
 * Capa, título, papéis, descrição e ano. No mobile tudo empilha embaixo da
 * capa; no desktop o nome do site fica sobre a capa e as informações se
 * dividem em duas colunas.
 */
export function ProjectHeader({ siteName, project }: ProjectHeaderProps) {
  // Vindo da home, a capa chega voando do card e só aparece quando pousa
  const cover = useSharedCoverTarget(project.slug)

  return (
    <header className={projectHeaderClassName}>
      {/* Vindo pela capa compartilhada a moldura fica parada: quem chega é o overlay */}
      <motion.div
        className="w-full"
        variants={cover.entering ? undefined : revealItem}
      >
        <ProjectCoverFrame
          ref={cover.ref}
          siteName={siteName}
          className={cover.hidden ? 'opacity-0' : undefined}
        >
          <ResponsiveImageView
            alt={project.title}
            fetchPriority="high"
            image={project.coverImages}
            imgClassName="h-full w-full object-cover"
            loading="eager"
          />
        </ProjectCoverFrame>
      </motion.div>

      <motion.div
        className="flex w-full flex-col gap-4 text-black lg:max-w-[1132px] lg:flex-row lg:items-center lg:justify-between"
        {...projectRevealProps(cover.entering, 0.1)}
      >
        <div className="flex flex-col gap-4">
          <h1 className="lg:text-dark-black text-[38px] font-bold lg:text-[66px] lg:leading-[98%]">
            {project.title}
          </h1>
          {project.badges.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold">Role</p>
              <ul className="flex flex-wrap gap-2">
                {project.badges.map((badge) => (
                  <li
                    className="bg-blue rounded-full px-4 py-1 text-xs text-white"
                    key={badge}
                  >
                    {badge}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="lg:text-dark-black flex flex-col gap-4 lg:w-[323px]">
          <p className="text-sm">{project.description}</p>
          <div className="flex flex-col gap-2 text-xs lg:text-sm">
            <p className="text-xs font-bold">Year</p>
            <p className="text-dark-black">{project.year}</p>
          </div>
        </div>
      </motion.div>

      <motion.div {...projectRevealProps(cover.entering, 0.2)}>
        <BackButton />
      </motion.div>
    </header>
  )
}

// Volta para onde a pessoa estava; entrando direto pela URL, vai para a home
function BackButton() {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  return (
    <Link
      to="/"
      resetScroll={false}
      className="text-off-white flex items-center gap-2.5 rounded-full bg-black px-6 py-3.5 text-lg transition-colors hover:bg-black/80"
      onClick={(event) => {
        if (!canGoBack) return
        event.preventDefault()
        router.history.back()
      }}
    >
      <img src={backIcon} alt="" className="size-8" />
      Back
    </Link>
  )
}
