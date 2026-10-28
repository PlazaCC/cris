import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { appearType, heroSlides } from './animations'
import { heroArt, type HeroArtId } from './art'
import { DESKTOP_FRAME, MOBILE_FRAME, stageVars } from './stage'

gsap.registerPlugin(useGSAP)

/*
 * Hero da home: conteúdo fixo (desenhado no Figma), não vem do banco.
 * Abre em "Polymath" (com o "a" de tipografia ao fundo) e percorre as
 * disciplinas em loop; cada palavra troca a ilustração do palco e a barra
 * amarela marca o tempo de cada slide.
 * Cada saída prepara a próxima entrada (coreografia em animations.ts).
 * O SSR entrega o estado inicial (Polymath montado), que também é o estado
 * fixo para quem prefere movimento reduzido.
 */

const SLIDES: { art: HeroArtId; word: string }[] = [
  { art: 'type', word: 'Polymath' },
  { art: '3d', word: '3D' },
  { art: 'motion', word: 'Motion' },
  { art: 'visual', word: 'Visual' },
  { art: 'experience', word: 'Experience' },
]

// Tempo de cada slide montado, entre a entrada e a saída
const HOLD = 3.2
const WORD_SWAP = 0.8

const artIds = Object.keys(heroArt) as HeroArtId[]

type HomeHeroProps = {
  siteName: string
}

export function HomeHero({ siteName }: HomeHeroProps) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          isMobile: '(max-width: 767px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion } = context.conditions ?? {}
          const section = root.current
          if (reduceMotion || !section) return

          const layer = section.querySelector(
            `[data-layer="${isDesktop ? 'desktop' : 'mobile'}"]`
          )
          const slot = section.querySelector<HTMLElement>('[data-word-slot]')
          const progress = section.querySelector('[data-progress]')
          const words = gsap.utils.toArray<HTMLElement>('[data-word]', section)
          if (!layer || !slot || !progress) return

          gsap.set(words.slice(1), { autoAlpha: 0, yPercent: 70 })

          // A largura é medida na hora da troca, não na montagem: a Gabarito chega
          // depois (via @import) e a largura muda entre desktop e mobile.
          // Só a palavra ativa fica com display, então o slot volta ao tamanho natural.
          let resize: gsap.core.Tween | undefined
          const resizeSlot = (from: number, to: number) => {
            resize?.kill()
            const fromWidth = words[from].getBoundingClientRect().width
            const toWidth = words[to].getBoundingClientRect().width
            resize = gsap.fromTo(
              slot,
              { width: fromWidth },
              {
                width: toWidth,
                duration: WORD_SWAP,
                ease: 'power3.inOut',
                // Ao encolher, espera a palavra antiga sair para não cortá-la
                delay: toWidth < fromWidth ? 0.35 : 0,
                clearProps: 'width',
              }
            )
          }

          const tl = gsap.timeline({ repeat: -1 })

          const swapWord = (from: number, to: number, at: number) => {
            const label = `word-${to}`
            tl.addLabel(label, at)
              .set(words[to], { display: 'block' }, label)
              .call(resizeSlot, [from, to], label)
              .to(
                words[from],
                {
                  yPercent: -70,
                  autoAlpha: 0,
                  duration: 0.45,
                  ease: 'power3.in',
                },
                label
              )
              .set(words[from], { display: 'none' }, `${label}+=0.45`)
              .fromTo(
                words[to],
                { yPercent: 70, autoAlpha: 0 },
                {
                  yPercent: 0,
                  autoAlpha: 1,
                  duration: 0.55,
                  ease: 'power3.out',
                  immediateRender: false,
                },
                `${label}+=0.3`
              )
          }

          const arts = SLIDES.map(({ art }) =>
            layer.querySelector(`[data-slide="${art}"]`)
          )
          if (arts.some((art) => !art)) return
          const slides = arts as Element[]
          const animations = SLIDES.map(({ art }) => heroSlides[art])

          // Começa com Polymath já na tela (SSR): a pen tool roda sobre ele
          let time = 0
          const enterFirst = animations[0].enter(slides[0])
          tl.add(enterFirst, time)
          time += enterFirst.duration()
          tl.add(animations[0].idle(slides[0], HOLD), time)
          time += HOLD

          // Momentos em que a palavra troca: a barra amarela vai de um ao outro
          const swaps: number[] = []

          slides.forEach((slide, from) => {
            const to = (from + 1) % slides.length
            const isLoopEnd = to === 0

            swaps.push(time)
            swapWord(from, to, time)

            const exit = animations[from].exit(slide)
            tl.add(exit, time).set(
              slide,
              { autoAlpha: 0 },
              time + exit.duration()
            )

            // A próxima entra quando a saída termina (ou um pouco antes, na passagem de bastão)
            time +=
              exit.duration() -
              Math.min(animations[from].handoff ?? 0, exit.duration())
            tl.set(slides[to], { autoAlpha: 1 }, time)

            // Na volta, o "a" só reaparece: a pen tool roda no começo do loop
            const enter = isLoopEnd
              ? appearType(slides[to])
              : animations[to].enter(slides[to])
            tl.add(enter, time)
            time += enter.duration()

            if (!isLoopEnd) {
              tl.add(animations[to].idle(slides[to], HOLD), time)
              time += HOLD
            }
          })

          // Barra de progresso: cada palavra preenche a barra até a próxima troca.
          // O Polymath atravessa o fim do loop (do último swap ao primeiro).
          const loopEnd = time
          const lastSwap = swaps[swaps.length - 1]
          const polymathSpan = loopEnd - lastSwap + swaps[0]
          const atLoopEnd = (loopEnd - lastSwap) / polymathSpan

          tl.fromTo(
            progress,
            { scaleX: atLoopEnd },
            {
              scaleX: 1,
              duration: swaps[0],
              ease: 'none',
              immediateRender: false,
            },
            0
          )
          swaps.forEach((start, index) => {
            const isLast = index === swaps.length - 1
            tl.fromTo(
              progress,
              { scaleX: 0 },
              {
                scaleX: isLast ? atLoopEnd : 1,
                duration: (isLast ? loopEnd : swaps[index + 1]) - start,
                ease: 'none',
                immediateRender: false,
              },
              start
            )
          })

          // Em dev, permite inspecionar/pausar a coreografia pelo console
          if (import.meta.env.DEV) {
            Object.assign(window, { __heroTimeline: tl })
          }

          const observer = new IntersectionObserver(([entry]) => {
            if (entry?.isIntersecting) tl.resume()
            else tl.pause()
          })
          observer.observe(section)

          return () => {
            observer.disconnect()
            resize?.revert()
          }
        },
        root
      )

      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <section
      ref={root}
      className="h-dvh w-full px-5 pt-10 pb-[100px] md:px-10 md:pt-9 md:pb-[115px]"
    >
      <div className="bg-off-white relative flex h-full w-full flex-col overflow-hidden rounded-4xl shadow-2xl md:justify-between md:p-[53px] md:pb-[95px]">
        <div
          aria-hidden="true"
          className="[container-type:size] absolute inset-0"
        >
          <ArtLayer layer="desktop" />
          <ArtLayer layer="mobile" />
        </div>

        <span className="relative hidden text-[32px] leading-[100%] font-bold text-black md:block">
          {siteName}
        </span>

        <div className="absolute inset-x-[21px] top-[39%] flex flex-col gap-16 md:relative md:inset-auto md:top-auto">
          <h1 className="text-dark-black text-[44px] leading-[0.98] md:text-[88px]">
            <span className="sr-only">
              Polymath designer, in a relationship with interactivity.
            </span>
            <span aria-hidden="true">
              <span
                data-word-slot
                className="relative inline-grid overflow-clip pb-[0.12em] align-top"
              >
                <span className="bg-blue absolute bottom-[0.06em] left-0 h-1 w-full md:bottom-[0.1em] md:h-2">
                  {/* transform inline (não `scale-x-0`): o Tailwind 4 usa a propriedade `scale`, que o GSAP não sobrescreve */}
                  <span
                    data-progress
                    className="bg-yellow block h-full w-full origin-left"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </span>
                {SLIDES.map((slide, index) => (
                  <span
                    key={slide.art}
                    data-word
                    className={cn(
                      'relative w-max justify-self-start [grid-area:1/1] md:text-white md:mix-blend-difference',
                      index > 0 && 'hidden'
                    )}
                  >
                    {slide.word}
                  </span>
                ))}
              </span>
              <br className="md:hidden" />{' '}
              <span className="md:text-white md:mix-blend-difference">
                designer, in a <br className="max-md:hidden" />
                relationship with interactivity.
              </span>
            </span>
          </h1>
          <p className="text-dark-black relative text-lg leading-[normal]">
            Hi, I'm <span className="text-blue">Cris</span>, a multidisciplinary
            designer who combines different design approaches to{' '}
            <br className="max-md:hidden" />
            solve my clients' needs.
          </p>
        </div>
      </div>
    </section>
  )
}

function ArtLayer({ layer }: { layer: 'desktop' | 'mobile' }) {
  const frame = layer === 'desktop' ? DESKTOP_FRAME : MOBILE_FRAME

  return (
    <div
      data-layer={layer}
      className={cn(
        'absolute inset-0',
        layer === 'desktop' ? 'max-md:hidden' : 'md:hidden'
      )}
      style={stageVars(frame)}
    >
      {artIds.map((id) => {
        const Art = heroArt[id][layer === 'desktop' ? 'Desktop' : 'Mobile']
        return (
          <div
            key={id}
            data-slide={id}
            className={cn(
              'absolute inset-0',
              id !== SLIDES[0].art && 'invisible'
            )}
          >
            <Art />
          </div>
        )
      })}
    </div>
  )
}
