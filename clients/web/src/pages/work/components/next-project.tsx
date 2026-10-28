import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import nextIcon from '@/assets/icons/arrow-right-circle.svg'
import { cn } from '@/lib/utils'

type Neighbor = { slug: string; title: string }
type Side = 'previous' | 'next'

// Projetos vizinhos na ordem da home (circular). No desktop o terço esquerdo
// da área abre o anterior e os dois terços restantes o próximo; só o card do
// lado sob o mouse aparece. No mobile, sem hover, os dois cards ficam empilhados
export function NextProject({
  previous,
  next,
}: {
  previous: Neighbor
  next: Neighbor
}) {
  const [active, setActive] = useState<Side>('next')

  return (
    <section className="m-auto w-full max-w-[1440px] px-5 py-[55px] lg:px-10 lg:py-32">
      <nav
        aria-label="Projetos"
        className="bg-blue relative flex h-[530px] flex-col justify-end gap-2 rounded-[32px] lg:block lg:h-[484px]"
        onPointerLeave={() => setActive('next')}
      >
        <NeighborLink
          side="previous"
          project={previous}
          visible={active === 'previous'}
          onActivate={setActive}
          className="lg:left-0 lg:w-1/3 lg:justify-start"
        />
        <NeighborLink
          side="next"
          project={next}
          visible={active === 'next'}
          onActivate={setActive}
          className="lg:right-0 lg:w-2/3 lg:justify-end"
        />
      </nav>
    </section>
  )
}

function NeighborLink({
  side,
  project,
  visible,
  onActivate,
  className,
}: {
  side: Side
  project: Neighbor
  visible: boolean
  onActivate: (side: Side) => void
  className: string
}) {
  const label = side === 'next' ? 'Next Project' : 'Previous Project'

  return (
    <Link
      to="/work/$slug"
      params={{ slug: project.slug }}
      // O AnimatedOutlet volta ao topo quando a página nova monta; o reset do
      // router pularia a página antiga para o topo durante a saída
      resetScroll={false}
      aria-label={`${label}: ${project.title}`}
      onPointerEnter={() => onActivate(side)}
      onFocus={() => onActivate(side)}
      className={cn(
        'group flex lg:absolute lg:inset-y-0 lg:items-center lg:px-[26px]',
        className
      )}
    >
      <span
        className={cn(
          'bg-off-white flex w-full items-center gap-12 rounded-2xl p-8 transition-[opacity,translate] duration-300 lg:w-[360px]',
          !visible &&
            (side === 'next'
              ? 'lg:translate-x-4 lg:opacity-0'
              : 'lg:-translate-x-4 lg:opacity-0')
        )}
      >
        <span className="text-dark-black flex-1 text-5xl leading-[98%] font-bold">
          {label}
        </span>
        <img
          src={nextIcon}
          alt=""
          className={cn(
            'size-8 transition-transform duration-300',
            side === 'next'
              ? 'group-hover:-rotate-45'
              : 'rotate-180 group-hover:rotate-[225deg]'
          )}
        />
      </span>
    </Link>
  )
}
