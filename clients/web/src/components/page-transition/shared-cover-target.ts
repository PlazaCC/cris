import type { MotionProps } from 'framer-motion'
import { type MouseEvent, useEffect, useRef, useState } from 'react'

import {
  type CoverBox,
  usePageTransitionStore,
} from '@/stores/page-transition-store'

/*
 * Coreografia em três tempos, sem nada pesado acontecendo enquanto a capa voa:
 * 1. out: o conteúdo da página atual sai e a capa fica parada no card;
 * 2. voo: só a capa se move (a página antiga continua montada e imóvel);
 * 3. in: a página nova monta com a capa já no lugar e o conteúdo entra.
 */
export const COVER_TIMING = {
  contentOut: 0.35,
  /*
   * O overlay só assume quando o out termina: o card de origem some nesse
   * frame, e os cards empilhados atrás dele precisam já ter saído
   */
  flightDelay: 0.35,
  flight: 0.85,
} as const

export const COVER_FLIGHT_END = COVER_TIMING.flightDelay + COVER_TIMING.flight

// Responde já nos primeiros frames: um ease-in puro parece atraso no clique
const CONTENT_EASE_OUT = [0.4, 0, 0.2, 1] as const
const CONTENT_EASE_IN = [0.25, 1, 0.5, 1] as const

// Saída do conteúdo da página atual enquanto a capa se prepara para voar
export function coverContentOut(leaving: boolean, delay = 0) {
  return {
    animate: leaving ? { opacity: 0, y: -24 } : { opacity: 1, y: 0 },
    transition: {
      duration: COVER_TIMING.contentOut,
      ease: CONTENT_EASE_OUT,
      delay: leaving ? delay : 0,
    },
  } satisfies MotionProps
}

// Entrada do conteúdo da página nova, que monta com a capa já pousada
export function coverContentIn(entering: boolean, delay = 0) {
  return {
    initial: entering ? { opacity: 0, y: 32 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: CONTENT_EASE_IN, delay },
  } satisfies MotionProps
}

// A página nova chegou pela capa compartilhada? Lido só na montagem
export function useCoverEntering(slug: string) {
  const [entering] = useState(
    () => usePageTransitionStore.getState().cover?.slug === slug
  )
  return entering
}

// Valores inteiros: previsão e medição real iguais não reiniciam a animação
export function measureCoverBox(element: HTMLElement): CoverBox {
  const rect = element.getBoundingClientRect()
  return {
    top: Math.round(rect.top),
    left: Math.round(rect.left),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    borderRadius: getComputedStyle(element).borderTopLeftRadius,
  }
}

/*
 * Chamado no clique do card: guarda a posição e a imagem do card para o
 * overlay voar até a capa do projeto. Cliques que abrem nova aba seguem o
 * fluxo normal.
 */
export function beginCoverTransition(
  event: MouseEvent,
  frame: HTMLElement | null,
  slug: string
) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !frame ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return
  }

  const img = frame.querySelector('img')
  const src = img?.currentSrc || img?.src
  if (!src) return

  usePageTransitionStore.getState().startCoverTransition({
    slug,
    src,
    source: frame,
    from: measureCoverBox(frame),
    startedAt: performance.now(),
  })
}

/*
 * Usado pela capa do header do projeto: enquanto a capa daquele slug está
 * voando, a imagem real fica escondida; depois de montar, decodificar e o
 * scroll voltar ao topo, informa a posição real para o overlay.
 */
export function useSharedCoverTarget(slug: string) {
  const ref = useRef<HTMLDivElement>(null)
  const entering = useCoverEntering(slug)
  const isTarget = usePageTransitionStore((s) => s.cover?.slug === slug)
  const hidden = usePageTransitionStore(
    (s) => s.cover?.slug === slug && !s.revealed
  )

  useEffect(() => {
    const frame = ref.current
    if (!isTarget || !frame) return

    let cancelled = false
    const raf = requestAnimationFrame(() => {
      const img = frame.querySelector('img')
      void (img ? img.decode() : Promise.resolve())
        .catch(() => undefined)
        .then(() => {
          if (cancelled) return
          usePageTransitionStore
            .getState()
            .setCoverTarget(measureCoverBox(frame))
        })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [isTarget])

  return { ref, hidden, entering }
}
