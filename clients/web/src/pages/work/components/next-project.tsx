import { Link } from '@tanstack/react-router'

import nextIcon from '@/assets/icons/arrow-right-circle.svg'

// Próximo projeto na ordem da home; depois do último volta para o primeiro
export function NextProject({ slug, title }: { slug: string; title: string }) {
  return (
    <section className="m-auto w-full max-w-[1440px] px-5 py-[55px] lg:px-10 lg:py-32">
      <Link
        to="/work/$slug"
        params={{ slug }}
        // O AnimatedOutlet volta ao topo quando a página nova monta; o reset do
        // router pularia a página antiga para o topo durante a saída
        resetScroll={false}
        aria-label={`Next project: ${title}`}
        className="group bg-blue flex h-[530px] items-end rounded-[32px] lg:h-[484px] lg:items-center lg:justify-end lg:px-[26px]"
      >
        <span className="bg-off-white flex w-full items-center gap-12 rounded-2xl p-8 lg:w-[360px]">
          <span className="text-dark-black flex-1 text-5xl leading-[98%] font-bold">
            Next Project
          </span>
          <img
            src={nextIcon}
            alt=""
            className="size-8 transition-transform duration-300 group-hover:-rotate-45"
          />
        </span>
      </Link>
    </section>
  )
}
