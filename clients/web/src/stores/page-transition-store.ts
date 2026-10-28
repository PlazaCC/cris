import { create } from 'zustand'

export type CoverBox = {
  top: number
  left: number
  width: number
  height: number
  borderRadius: string
}

export type SharedCover = {
  slug: string
  src: string
  // Moldura do card de origem; a posição de partida é medida de novo no voo,
  // depois que o card desfaz o blur/escala do empilhamento
  source: HTMLElement
  from: CoverBox
  // performance.now() do clique; a troca de página conta a partir dele
  startedAt: number
}

interface PageTransitionStore {
  // Sentido da transição padrão pela ordem do menu: 1 avança, -1 volta
  direction: 1 | -1
  setDirection: (direction: 1 | -1) => void
  // Capa que voa do card da home até o header do projeto; null fora da transição
  cover: SharedCover | null
  // Posição real da capa na página nova, medida depois que ela montou
  target: CoverBox | null
  // O overlay assumiu o lugar do card de origem, que então some da página antiga
  launched: boolean
  // A página nova já mostra a própria capa e o overlay pode sair
  revealed: boolean
  startCoverTransition: (cover: SharedCover) => void
  launchCover: () => void
  setCoverTarget: (target: CoverBox) => void
  revealCover: () => void
  endCoverTransition: () => void
}

export const usePageTransitionStore = create<PageTransitionStore>((set) => ({
  direction: 1,
  setDirection: (direction) => set({ direction }),
  cover: null,
  target: null,
  launched: false,
  revealed: false,
  startCoverTransition: (cover) =>
    set({ cover, target: null, launched: false, revealed: false }),
  launchCover: () => set({ launched: true }),
  setCoverTarget: (target) => set({ target }),
  revealCover: () => set({ revealed: true }),
  endCoverTransition: () =>
    set({ cover: null, target: null, launched: false, revealed: false }),
}))
