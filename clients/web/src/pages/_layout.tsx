import { Menu } from '@/components/menu'
import { useGlobal } from '@/features/global/hooks/use-global'
import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/stores/navigation-store'
import {
  createRoute,
  getRouterContext,
  Outlet,
  useMatch,
  useMatches,
} from '@tanstack/react-router'
import { AnimatePresence, motion, useIsPresent, Variants } from 'framer-motion'
import cloneDeep from 'lodash.clonedeep'
import {
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import { rootRoute } from './root'

AppLayout.route = createRoute({
  id: 'app-layout',
  component: AppLayout,
  getParentRoute: () => rootRoute,
})

export function AppLayout() {
  const { data: global } = useGlobal()
  const matches = useMatches()
  const match = useMatch({ strict: false })
  const nextIndex = matches.findIndex((m) => m.id === match.id) + 1
  const nextMatch = matches[nextIndex]

  useEffect(() => {
    if (!global) {
      return
    }

    if (global.defaultSeo.metaTitle) {
      document.title = global.defaultSeo.metaTitle
    }

    const faviconHref = global.favicon
    if (!faviconHref) {
      return
    }

    const iconLink =
      document.querySelector<HTMLLinkElement>("link[rel='icon']") ??
      document.createElement('link')

    iconLink.rel = 'icon'
    iconLink.href = faviconHref

    if (!iconLink.parentElement) {
      document.head.appendChild(iconLink)
    }
  }, [global])

  return (
    <div className={cn('relative w-full')}>
      <AnimatePresence mode="wait">
        <AnimatedOutlet key={nextMatch?.id ?? match.id} />
      </AnimatePresence>
      <Menu />
    </div>
  )
}

const AnimatedOutlet = forwardRef<HTMLDivElement>((_, ref) => {
  const RouterContext = getRouterContext()
  const routerContext = useContext(RouterContext)
  const renderedContext = useRef(routerContext)
  const isPresent = useIsPresent()
  const setCanNavigate = useNavigationStore((state) => state.setCanNavigate)

  if (isPresent) {
    renderedContext.current = cloneDeep(routerContext)
  }

  // Scrolla para o topo ao montar (a página nova monta com opacity: 0,
  // então o scroll é imperceptível graças ao mode="wait")
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
      initial: 'initial',
      animate: 'enter',
      exit: 'exit',
    }
  }

  const opacity: Variants = {
    initial: {
      opacity: 0,
      translateX: '50%',
      scale: 0.9,
    },
    enter: {
      opacity: 1,
      translateX: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1],
      },
    },
    exit: {
      opacity: 0,
      translateX: '-50%',
      scale: 0.9,
      transition: {
        duration: 0.5,
        ease: [0.5, 0, 0.75, 0],
      },
    },
  }

  return (
    <motion.div ref={ref} {...anim(opacity)}>
      <RouterContext.Provider value={renderedContext.current}>
        <Outlet />
      </RouterContext.Provider>
    </motion.div>
  )
})
