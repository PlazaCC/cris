import type { MotionProps, Variants } from 'framer-motion'

import { usePageTransitionStore } from '@/stores/page-transition-store'

import { coverContentIn } from './shared-cover-target'

export const PAGE_EASE = [0.65, 0, 0.35, 1] as const
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

export const REVEAL_STAGGER = 0.08
export const PAGE_EXIT_OFFSET = 64
const REVEAL_OFFSET = 48

/*
 * Item de entrada da transição padrão de página. Não tem initial/animate
 * próprios: herda os estados `initial` → `enter` do wrapper do AnimatedOutlet,
 * que os escalona em ordem (`staggerChildren`). Só vale para o conteúdo da
 * primeira dobra; o resto da página aparece com o wrapper.
 */
export const revealItem: Variants = {
  // Lido na montagem: os itens herdam o rótulo do wrapper, não o `custom`,
  // então o sentido vem do store (definido antes de a página nova montar)
  initial: () => ({
    opacity: 0,
    x: REVEAL_OFFSET * usePageTransitionStore.getState().direction,
  }),
  enter: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: REVEAL_EASE },
  },
}

// Na página do projeto: vindo pela capa compartilhada, o conteúdo entra junto
// com a capa pousada; vindo de outro lugar, entra em ordem com o resto
export function projectRevealProps(
  entering: boolean,
  coverDelay = 0
): MotionProps {
  return entering ? coverContentIn(true, coverDelay) : { variants: revealItem }
}
