import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useGlobal } from '@/features/global/hooks/use-global'
import {
  type CoverBox,
  type SharedCover,
  usePageTransitionStore,
} from '@/stores/page-transition-store'

import {
  ProjectCoverFrame,
  projectHeaderClassName,
} from './project-cover-frame'
import { COVER_TIMING, measureCoverBox } from './shared-cover-target'

const FLIGHT = {
  duration: COVER_TIMING.flight,
  ease: [0.76, 0, 0.24, 1],
} as const
// Sem a página nova assumir (loader lento, erro, 404), o overlay some sozinho
const HANDOFF_TIMEOUT = 2000

// Fica no AppLayout, fora do AnimatePresence, para sobreviver à troca de página
export function SharedCoverOverlay() {
  const cover = usePageTransitionStore((s) => s.cover)
  const { data: global } = useGlobal()

  if (!cover) return null

  return (
    <CoverFlight
      key={cover.slug}
      cover={cover}
      siteName={global?.siteName ?? 'unk'}
    />
  )
}

function CoverFlight({
  cover,
  siteName,
}: {
  cover: SharedCover
  siteName: string
}) {
  const target = usePageTransitionStore((s) => s.target)
  const launched = usePageTransitionStore((s) => s.launched)
  const launchCover = usePageTransitionStore((s) => s.launchCover)
  const revealCover = usePageTransitionStore((s) => s.revealCover)
  const endCoverTransition = usePageTransitionStore((s) => s.endCoverTransition)
  const probeRef = useRef<HTMLDivElement>(null)
  const [predicted, setPredicted] = useState<CoverBox | null>(null)
  const [from, setFrom] = useState(cover.from)
  const [arrived, setArrived] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  // A réplica invisível do header diz onde a capa vai estar com a página no topo
  useLayoutEffect(() => {
    if (probeRef.current) setPredicted(measureCoverBox(probeRef.current))
  }, [])

  /*
   * Até o painel do card sair, quem aparece é o próprio card. A imagem é
   * decodificada antes de o overlay montar: ele e o sumiço do card acontecem
   * no mesmo frame, e um overlay ainda em branco deixaria um buraco na tela.
   */
  useEffect(() => {
    let cancelled = false
    const image = new Image()
    image.src = cover.src
    const decoded = image.decode().catch(() => undefined)
    const delay = new Promise((resolve) =>
      setTimeout(resolve, COVER_TIMING.flightDelay * 1000)
    )

    void Promise.all([decoded, delay]).then(() => {
      if (cancelled) return
      setFrom(measureCoverBox(cover.source))
      launchCover()
    })

    return () => {
      cancelled = true
    }
  }, [cover.source, cover.src, launchCover])

  useEffect(() => {
    if (!arrived) return
    const timeout = setTimeout(() => setTimedOut(true), HANDOFF_TIMEOUT)
    return () => clearTimeout(timeout)
  }, [arrived])

  const leaving = arrived && (target !== null || timedOut)

  // A capa real aparece embaixo do overlay, que então some com um fade curto
  useEffect(() => {
    if (leaving) revealCover()
  }, [leaving, revealCover])

  const box = target ?? predicted ?? cover.from

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none invisible fixed inset-x-0 top-0"
      >
        <header className={projectHeaderClassName}>
          <ProjectCoverFrame ref={probeRef} siteName={siteName} />
        </header>
      </div>

      {launched && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed z-[5] overflow-hidden will-change-[top,left,width,height]"
          initial={{ ...from, opacity: 1 }}
          animate={{ ...box, opacity: leaving ? 0 : 1 }}
          transition={{ ...FLIGHT, opacity: { duration: 0.25 } }}
          onAnimationComplete={() => {
            if (leaving) endCoverTransition()
            else if (predicted) setArrived(true)
          }}
        >
          <img src={cover.src} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
    </>
  )
}
