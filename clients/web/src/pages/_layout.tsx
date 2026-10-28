import { Footer } from '@/components/footer'
import { Menu } from '@/components/menu'
import {
  PAGE_EASE,
  PAGE_EXIT_OFFSET,
  REVEAL_STAGGER,
} from '@/components/page-transition/reveal'
import { SharedCoverOverlay } from '@/components/page-transition/shared-cover'
import { COVER_FLIGHT_END } from '@/components/page-transition/shared-cover-target'
import { menuDirection } from '@/lib/menu-items'
import { initSmoothScroll } from '@/lib/smooth-scroll'
import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/stores/navigation-store'
import { usePageTransitionStore } from '@/stores/page-transition-store'
import {
  Outlet,
  type RouteComponent,
  useMatch,
  useMatches,
  useRouter,
} from '@tanstack/react-router'
import { AnimatePresence, motion, useIsPresent, Variants } from 'framer-motion'
import { forwardRef, useEffect, useLayoutEffect } from 'react'

// Título e favicon vêm do `head()` em routes/__root.tsx
export function AppLayout() {
  const matches = useMatches()
  const match = useMatch({ strict: false })
  const nextIndex = matches.findIndex((m) => m.id === match.id) + 1
  const nextMatch = matches[nextIndex]
  const router = useRouter()
  const page = nextMatch
    ? router.routesById[nextMatch.routeId].options.component
    : undefined
  // Com a capa voando, cada página anima o próprio conteúdo (out/in) e o
  // wrapper só segura a troca até a capa pousar, contando a partir do clique
  // (o router pode trocar a página depois, quando o loader resolve)
  const cover = usePageTransitionStore((state) => state.cover)
  const coverHold = cover
    ? Math.max(
        0,
        COVER_FLIGHT_END - (performance.now() - cover.startedAt) / 1000
      )
    : null
  const direction = usePageTransitionStore((state) => state.direction)
  const setDirection = usePageTransitionStore((state) => state.setDirection)
  const custom: PageCustom = { hold: coverHold, direction }

  // O sentido sai da ordem do menu e é definido antes de a página nova montar
  // (vale também para o Back do navegador)
  useEffect(
    () =>
      router.subscribe('onBeforeNavigate', ({ fromLocation, toLocation }) => {
        if (!fromLocation) return
        setDirection(menuDirection(fromLocation.pathname, toLocation.pathname))
      }),
    [router, setDirection]
  )

  useEffect(() => {
    void initSmoothScroll()
    // O scroll entre páginas é do AnimatedOutlet: a restauração nativa do
    // navegador no Back pularia a página antiga enquanto ela ainda está saindo
    window.history.scrollRestoration = 'manual'
  }, [])

  return (
    <>
      <div className={cn('relative w-full overflow-x-clip')}>
        <AnimatePresence mode="wait" custom={custom}>
          <AnimatedOutlet
            key={nextMatch?.id ?? match.id}
            page={page}
            custom={custom}
          />
        </AnimatePresence>
        <SharedCoverOverlay />
        <Menu />
      </div>
      <Footer />
    </>
  )
}

type PageCustom = {
  // Segundos que a página antiga ainda espera a capa pousar; null fora da
  // transição de capa
  hold: number | null
  direction: 1 | -1
}

type AnimatedOutletProps = {
  // O AnimatePresence preserva as props do elemento que está saindo, então a
  // página antiga continua renderizando o próprio componente durante o exit
  page?: RouteComponent
  // Repassado também como `custom` do AnimatePresence, que o entrega à página
  // que está saindo
  custom: PageCustom
}

const AnimatedOutlet = forwardRef<HTMLDivElement, AnimatedOutletProps>(
  ({ page: Page, custom }, ref) => {
    const isPresent = useIsPresent()
    const setCanNavigate = useNavigationStore((state) => state.setCanNavigate)

    // Scrolla para o topo ao montar (a página nova monta invisível, então o
    // scroll é imperceptível graças ao mode="wait"). Por isso os links que
    // trocam de página usam resetScroll={false}: o reset do router pularia a
    // página antiga para o topo enquanto ela ainda está saindo
    useLayoutEffect(() => {
      window.scrollTo(0, 0)
    }, [])

    // Controla a navegação durante as transições
    useEffect(() => {
      setCanNavigate(isPresent)
    }, [isPresent, setCanNavigate])

    const anim = (variants: Variants) => {
      return {
        variants,
        custom,
        initial: 'initial',
        animate: 'enter',
        exit: 'exit',
      }
    }

    // Saída lateral suave; a entrada fica por conta dos itens `revealItem` de
    // cada página, que o wrapper escalona em ordem
    const page: Variants = {
      initial: ({ hold }: PageCustom) =>
        hold !== null ? { opacity: 1, x: 0 } : { opacity: 0, x: 0 },
      enter: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          ease: 'easeOut',
          delayChildren: 0.05,
          staggerChildren: REVEAL_STAGGER,
        },
      },
      exit: ({ hold, direction }: PageCustom) =>
        hold !== null
          ? // A página antiga fica imóvel durante o voo: nada de layout ou
            // montagem da página nova disputando frames com a capa
            { opacity: 0, transition: { duration: 0, delay: hold } }
          : {
              opacity: 0,
              // Avançando no menu a página sai pela esquerda; voltando, pela direita
              x: -PAGE_EXIT_OFFSET * direction,
              transition: { duration: 0.45, ease: PAGE_EASE },
            },
    }

    return (
      <motion.div
        ref={ref}
        {...anim(page)}
        // clip, não hidden: hidden cria um container de scroll e desliga o
        // position: sticky dos cards da home enquanto a página sai
        className={cn(!isPresent && 'pointer-events-none overflow-clip')}
      >
        {Page ? <Page /> : <Outlet />}
      </motion.div>
    )
  }
)
