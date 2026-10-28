import { gsap } from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

import type { HeroArtId } from './art'
import { DESKTOP_FRAME, MOBILE_FRAME } from './stage'

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin)

/*
 * Coreografia da hero. Cada slide tem três fases, encadeadas em sequência
 * pela timeline principal (sem sobreposição; cada saída "entrega" a próxima):
 *
 *   Polymath   pen tool: pontos e alças surgem e puxam a letra, que distorce
 *              → sai para a esquerda (ease-in exagerado)
 *   3D         um quadrado 2D surge no meio e abre no formato 3D (morph do `d`)
 *              → cai para baixo (ease-in exagerado)
 *   Motion     a câmera desce até o Motion com a bolinha já correndo pelo V;
 *              o rastro some em ordem logo depois que ela chega
 *              → a bolinha desenha o anel e a câmera anda até o Visual
 *   Visual     bolinha e rastro giram juntos em volta do núcleo;
 *              núcleo e formas entram com pop e as peças se equilibram
 *              → saem com pop invertido (scale-out com bounce)
 *   Experience entram com pop
 *              → são jogadas para a esquerda e o loop volta ao Polymath
 *
 * Estados iniciais são aplicados com `set` no primeiro frame de cada entrada:
 * com stagger, uma peça que ainda não começou não pode aparecer pronta.
 *
 * Os seletores usam os atributos `data-*` de art.tsx e o `data-name` que o
 * InlineSvg copia dos nomes das camadas do Figma.
 */

// "Ease-in exagerado" das saídas
const THROW = 'power4.in'
const POP = 'back.out(2.6)'
const POP_OUT = 'back.in(2.6)'

type Root = Element

const all = (root: Root, selector: string) =>
  Array.from(root.querySelectorAll<SVGElement | HTMLElement>(selector))

// Peças posicionadas no palco (filhos diretos do slide)
const parts = (slide: Root) => Array.from(slide.children)

const layerOf = (slide: Root) =>
  slide.closest<HTMLElement>('[data-layer]')?.dataset.layer === 'mobile'
    ? 'mobile'
    : 'desktop'

// Traços desenháveis: ignora os paths usados como máscara pelo export do Figma
function strokes(root: Root) {
  return all(
    root,
    '[data-draw] path[stroke]:not([mask]), [data-draw] defs path[data-name^="stroke"]'
  ).filter((el) => !el.closest('mask'))
}

// Desfaz o que a saída anterior deixou (o loop passa pelo mesmo slide de novo)
function reset(slide: Root) {
  const tl = gsap.timeline()
  tl.set(parts(slide), {
    autoAlpha: 1,
    xPercent: 0,
    yPercent: 0,
    scale: 1,
    rotation: 0,
  })
  return tl
}

// Evita o aviso "GSAP target not found" para camadas que só existem num layout
function when<T extends Element>(targets: T[], run: (targets: T[]) => unknown) {
  if (targets.length > 0) run(targets)
}

// Duração mínima da timeline (para fases sem tween até o fim)
const hold = (tl: gsap.core.Timeline, duration: number) =>
  tl.set({}, {}, duration)

/* ------------------------------------------------------------ Polymath */

// Âncora da curva no type-glyph desktop (Ellipse 2): as alças giram em volta dela
const PEN_ANCHOR = '321.61 139.824'

function pen(slide: Root) {
  return {
    letter: all(slide, '[data-name="a"]'),
    // Desktop: alças da pen tool (linha + ponta) e pontos de âncora
    anchors: all(slide, '[data-name="Ellipse 1"], [data-name="Ellipse 2"]'),
    leftArm: all(slide, '[data-name="Vector 3"]'),
    rightArm: all(slide, '[data-name="Vector 2"]'),
    tips: all(slide, '[data-name="Ellipse 4"], [data-name="Ellipse 3"]'),
    // Mobile: guias amarelas e pontos da construção da letra
    guides: all(slide, 'path[fill="#FFD786"]'),
    points: all(slide, '[data-name="Group 23"] path'),
  }
}

// Estado "antes de desenhar": usado na volta do loop, para a pen tool redesenhar
function hidePen(slide: Root, tl: gsap.core.Timeline, at = 0) {
  const p = pen(slide)
  tl.set(
    [...p.anchors, ...p.tips, ...p.points],
    { scale: 0, transformOrigin: '50% 50%' },
    at
  )
  if (p.leftArm.length > 0) tl.set(p.leftArm, { drawSVG: '100% 100%' }, at)
  if (p.rightArm.length > 0) tl.set(p.rightArm, { drawSVG: '0% 0%' }, at)
  if (p.guides.length > 0)
    tl.set(p.guides, { scaleX: 0, transformOrigin: '0% 50%' }, at)
  return tl
}

// Entrada: pontos e alças surgem, puxam a curva e a letra distorce junto
function enterType(slide: Root) {
  const p = pen(slide)
  const arms = [...p.leftArm, ...p.rightArm, ...p.tips]
  const tl = reset(slide)
  hidePen(slide, tl)

  // Desktop tem alças; mobile tem guias e pontos: cada lista pode vir vazia
  when(p.anchors, (t) =>
    tl.to(t, { scale: 1, duration: 0.4, ease: POP, stagger: 0.1 }, 0)
  )
  when(p.guides, (t) =>
    tl.to(t, { scaleX: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, 0)
  )
  when(p.points, (t) =>
    tl.to(
      t,
      {
        scale: 1,
        duration: 0.4,
        ease: POP,
        stagger: { each: 0.025, from: 'random' },
      },
      0.15
    )
  )

  if (p.leftArm.length > 0) {
    tl.to(
      p.leftArm,
      { drawSVG: '0% 100%', duration: 0.45, ease: 'power2.out' },
      0.25
    )
      .to(
        p.rightArm,
        { drawSVG: '0% 100%', duration: 0.45, ease: 'power2.out' },
        0.25
      )
      .to(p.tips, { scale: 1, duration: 0.35, ease: POP }, 0.55)
  }

  // Puxa a alça para um lado, depois para o outro, e solta com elástico.
  // A letra acompanha com skew/stretch, como se a curva estivesse sendo editada.
  const tug = (
    rotation: number,
    skewX: number,
    scaleY: number,
    duration: number,
    ease: string,
    at: string | number
  ) => {
    if (arms.length > 0)
      tl.to(arms, { rotation, svgOrigin: PEN_ANCHOR, duration, ease }, at)
    tl.to(
      p.letter,
      { skewX, scaleY, transformOrigin: '50% 100%', duration, ease },
      at
    )
  }
  tug(-22, 9, 1.06, 0.55, 'power2.inOut', 0.85)
  tug(14, -6, 0.97, 0.5, 'power2.inOut', 1.4)
  tug(0, 0, 1, 1.2, 'elastic.out(1, 0.35)', 1.9)

  return tl
}

// Volta do loop: a letra reaparece limpa, sem alças (a pen tool roda no início)
function appearType(slide: Root) {
  const p = pen(slide)
  const tl = reset(slide)
  hidePen(slide, tl)
  tl.fromTo(
    p.letter,
    { autoAlpha: 0, xPercent: 12, skewX: 0, scaleY: 1 },
    {
      autoAlpha: 1,
      xPercent: 0,
      duration: 0.8,
      ease: 'power3.out',
      immediateRender: false,
    },
    0
  )
  return tl
}

function idleType(slide: Root, duration: number) {
  const p = pen(slide)
  const arms = [...p.leftArm, ...p.rightArm, ...p.tips]
  const tl = gsap.timeline()
  if (arms.length > 0) {
    tl.to(
      arms,
      {
        rotation: 5,
        svgOrigin: PEN_ANCHOR,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      },
      0
    )
  }
  tl.to(
    p.letter,
    {
      skewX: -1.5,
      transformOrigin: '50% 100%',
      duration: duration / 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    },
    0
  )
  return hold(tl, duration)
}

function exitType(slide: Root) {
  return gsap
    .timeline()
    .to(parts(slide), { xPercent: -180, duration: 0.85, ease: THROW })
}

/* ------------------------------------------------------------------ 3D */

function stacks(slide: Root) {
  const [back, front] = all(slide, '[data-stack]')
  const rects = (stack?: Element) =>
    stack ? all(stack, '[data-name^="Rectangle"]') : []
  return { back, front, rects }
}

/*
 * Quadrado 2D no meio da composição, no sistema de coordenadas de cada pilha.
 * As camadas são quadrados inclinados (4 vértices: M L V L V Z), então o `d`
 * do quadrado tem a mesma estrutura e o GSAP interpola número a número.
 * A pilha da frente fica deslocada 24,4% da largura em relação à de trás;
 * o centro da composição é o ponto médio entre as duas.
 */
function squarePath(stack: Element, side: 'back' | 'front', size: number) {
  const svg = stack.querySelector('svg')
  const { width = 0, height = 0 } = svg?.viewBox.baseVal ?? {}
  const shift = width * 0.122 * (side === 'back' ? 1 : -1)
  const cx = width / 2 + shift
  const cy = height / 2 - shift
  const h = width * 0.3 * size
  return `M${cx - h} ${cy - h}L${cx + h} ${cy - h}V${cy + h}L${cx - h} ${cy + h}V${cy - h}Z`
}

// Começa como um quadrado 2D no meio e abre no formato 3D. As 10 camadas
// (2 pilhas de 5, uma por SVG) abrem juntas e com a mesma curva: parece que
// víamos a pilha de frente e a câmera mudou de ângulo
const OPEN_3D = 0.9

function enter3d(slide: Root) {
  const { back, front, rects } = stacks(slide)
  const tl = reset(slide)
  if (!back || !front) return tl

  const groups = [
    { stack: back, side: 'back' as const },
    { stack: front, side: 'front' as const },
  ]

  groups.forEach(({ stack, side }) => {
    const layers = rects(stack)
    const flat = squarePath(stack, side, 1)

    // O quadrado nasce com pop
    tl.set(layers, { x: 0, attr: { d: squarePath(stack, side, 0) } }, 0).to(
      layers,
      { attr: { d: flat }, duration: 0.55, ease: 'back.out(1.7)' },
      0
    )

    // O `d` original é lido aqui, antes de qualquer morph rodar
    layers.forEach((layer) => {
      tl.to(
        layer,
        {
          attr: { d: layer.getAttribute('d') ?? '' },
          duration: 1.2,
          ease: 'power3.inOut',
        },
        OPEN_3D
      )
    })
  })

  return tl
}

// Depois de abrir, os quadrados seguem se afastando no x: a profundidade
// continua aumentando. As 10 camadas formam uma diagonal só (as 5 de trás,
// depois as 5 da frente), cada uma a LAYER_STEP da largura do SVG da anterior
const LAYER_STEP = 17.451 / 357.745
// No mobile a pilha já encosta na borda do card, então abre menos
const SPREAD_3D = { desktop: 0.7, mobile: 0.3 }

function idle3d(slide: Root, duration: number) {
  const { back, front, rects } = stacks(slide)
  const tl = gsap.timeline()
  if (!back || !front) return hold(tl, duration)

  const layers = [...rects(back), ...rects(front)]
  const width = back.querySelector('svg')?.viewBox.baseVal.width ?? 0
  const middle = (layers.length - 1) / 2
  const spread = SPREAD_3D[layerOf(slide)]

  tl.to(
    layers,
    {
      x: (index: number) => (index - middle) * width * LAYER_STEP * spread,
      duration,
      ease: 'sine.inOut',
    },
    0
  )
  return hold(tl, duration)
}

// Cai para baixo: a bolinha do Motion entra logo em seguida
function exit3d(slide: Root) {
  return gsap.timeline().to(parts(slide), {
    yPercent: 230,
    duration: 0.8,
    ease: THROW,
    stagger: 0.08,
  })
}

/* -------------------------------------------------------------- Motion */

function motion(slide: Root) {
  return {
    ball: all(slide, '[data-name="Ellipse 11"]'),
    // Braço esquerdo do V (desce) e o direito (sobe até a bolinha)
    down: all(slide, '[data-name^="Ellipse 14"]'),
    up: all(slide, 'defs path[data-name^="stroke0"]'),
    reveal: all(slide, '[data-reveal]'),
  }
}

/*
 * Passagem Motion → Visual, como um movimento de câmera.
 * A bolinha para no fim do V; dali ela desenha o anel ao seu lado (com o anel
 * girado -90°, ela começa no topo dele) e a câmera anda até o anel ocupar o
 * seu lugar no Visual. CAMERA é o quanto o conteúdo se desloca, em px do Figma:
 *
 *   desktop  bolinha (760, 98)       anel se forma em (760, 174)   r 76
 *            anel no Visual (199, 166)  → deslocamento (-561, -8)
 *   mobile   bolinha (274.7, 81.4)   anel se forma em (274.7, 105.8) r 24.4
 *            anel no Visual (33.9, 164.7) → deslocamento (-240.8, 58.9)
 *
 * `dot` é o quanto a bolinha do anel começa ampliada para ter o tamanho da
 * bolinha do Motion (Ø44 → Ø21 no desktop, Ø19.45 → Ø6.73 no mobile).
 */
const CAMERA = {
  desktop: { x: -561, y: -8, dot: 44 / 21 },
  mobile: { x: -240.8, y: 58.9, dot: 19.45 / 6.73 },
}
const PAN_AT = 0.9
const PAN = 1.2

// Tamanho e posição de uma peça em px do Figma, lidos do style gerado por place()
function stageBox(el: Element) {
  const style = (el as HTMLElement).style
  const read = (value: string) =>
    Number(/([\d.-]+) \* var\(--u\)/.exec(value)?.[1] ?? 0)
  return {
    x: read(style.left),
    width: read(style.width),
    height: read(style.height),
  }
}

// Deslocamento em px do Figma convertido para % do tamanho da peça
function shiftBy(el: Element, x: number, y: number) {
  const { width, height } = stageBox(el)
  return {
    xPercent: width ? (x / width) * 100 : 0,
    yPercent: height ? (y / height) * 100 : 0,
  }
}

const DROP = 0.75
const CLIMB = 0.85
// O Motion entra de cima, como se a câmera descesse: o frame começa deslocado
// esta fração da altura para cima e assenta enquanto a bolinha já corre
const CAMERA_DROP = 0.5
// O rastro começa a sumir a 2/3 do percurso, em velocidade constante:
// o braço esquerdo inteiro e só depois o direito, em TRAIL_FADE segundos
const TRAIL_FADE_AT = 2 / 3
const TRAIL_FADE = 0.9

// A bolinha desce pelo braço esquerdo e sobe pelo direito, desenhando o rastro
function enterMotion(slide: Root) {
  const m = motion(slide)
  const tl = reset(slide)
  const [downPath] = m.down
  const [upPath] = m.up
  if (!downPath || !upPath) return tl

  // O braço direito termina exatamente onde a bolinha fica: o caminho é
  // deslocado para que esse ponto seja o (0, 0) da bolinha
  const downEl = downPath as SVGPathElement
  const upEl = upPath as SVGPathElement
  const end = upEl.getPointAtLength(upEl.getTotalLength())
  const along = (path: SVGPathElement) => ({
    path,
    offsetX: -end.x,
    offsetY: -end.y,
  })

  // Câmera descendo até o Motion
  const frame = layerOf(slide) === 'desktop' ? DESKTOP_FRAME : MOBILE_FRAME
  const run = DROP + CLIMB
  parts(slide).forEach((part) => {
    tl.set(part, shiftBy(part, 0, -frame.height * CAMERA_DROP), 0).to(
      part,
      { yPercent: 0, duration: run * 0.75, ease: 'power3.out' },
      0
    )
  })

  // A bolinha já chega com velocidade (linear na descida) e freia na subida
  tl.set([...m.down, ...m.up], { drawSVG: '0%' }, 0)
    .set(
      m.ball,
      { autoAlpha: 1, scale: 1, yPercent: 0, transformOrigin: '50% 50%' },
      0
    )
    .to(m.ball, { motionPath: along(downEl), duration: DROP, ease: 'none' }, 0)
    .to(m.down, { drawSVG: '100%', duration: DROP, ease: 'none' }, 0)
    .to(
      m.ball,
      { motionPath: along(upEl), duration: CLIMB, ease: 'sine.out' },
      DROP
    )
    .to(m.up, { drawSVG: '100%', duration: CLIMB, ease: 'sine.out' }, DROP)

  if (m.reveal.length > 0) {
    tl.set(m.reveal, { clipPath: 'inset(100% 0% 0% 0%)' }, 0).to(
      m.reveal,
      { clipPath: 'inset(0% 0% 0% 0%)', duration: CLIMB, ease: 'sine.out' },
      DROP
    )
  }

  // Rastro some em ordem, na mesma velocidade nos dois braços
  const downLength = downEl.getTotalLength()
  const upLength = upEl.getTotalLength()
  const fadeDown = (TRAIL_FADE * downLength) / (downLength + upLength)
  const fadeUp = TRAIL_FADE - fadeDown
  const fadeAt = run * TRAIL_FADE_AT

  tl.to(
    m.down,
    { drawSVG: '100% 100%', duration: fadeDown, ease: 'none' },
    fadeAt
  ).to(
    m.up,
    { drawSVG: '100% 100%', duration: fadeUp, ease: 'none' },
    fadeAt + fadeDown
  )
  when(m.reveal, (reveal) =>
    tl.to(
      reveal,
      { clipPath: 'inset(0% 0% 0% 100%)', duration: fadeUp, ease: 'none' },
      fadeAt + fadeDown
    )
  )

  return tl
}

// Só a bolinha fica, parada no fim do arco
const idleMotion = (_slide: Root, duration: number) =>
  hold(gsap.timeline(), duration)

// A bolinha dá lugar à do anel do Visual, que desenha o anel a partir dali,
// e a câmera anda até o Visual
function exitMotion(slide: Root) {
  const m = motion(slide)
  const camera = CAMERA[layerOf(slide)]
  const tl = gsap.timeline().set(m.ball, { autoAlpha: 0 }, 0)

  parts(slide).forEach((part) => {
    tl.to(
      part,
      {
        ...shiftBy(part, camera.x, camera.y),
        duration: PAN,
        ease: 'power3.inOut',
      },
      PAN_AT
    )
  })

  return tl
}

/* -------------------------------------------------------------- Visual */

// <filter> aplicado ao elemento (o id foi prefixado pelo InlineSvg)
function filterOf(root: Element | null, selector: string) {
  const el = root?.querySelector(`${selector}[filter]`)
  const id = /#([^)]+)/.exec(el?.getAttribute('filter') ?? '')?.[1]
  return (id && root?.querySelector(`[id="${id}"]`)) || undefined
}

// Sombra interna (deslocamento e desfoque) de um filtro do Figma
function shadeOf(filter?: Element) {
  const offset = filter?.querySelector('feOffset')
  const blur = filter?.querySelector('feGaussianBlur')
  if (!offset || !blur) return undefined
  const read = (el: Element, name: string) => Number(el.getAttribute(name) ?? 0)
  return {
    offset,
    blur,
    dx: read(offset, 'dx'),
    dy: read(offset, 'dy'),
    deviation: read(blur, 'stdDeviation'),
  }
}

/*
 * Anel desenhado a partir da bolinha, para trás (sentido anti-horário).
 * A bolinha fica embaixo do anel (como no Figma) e gira junto com ele: no
 * referencial dos dois, o rastro só cresce atrás da bolinha, então ela está
 * sempre na ponta, e o começo do rastro fica parado no mundo.
 */
function trailPath(track: Element, center: number) {
  const radius = (track as SVGPathElement).getTotalLength() / (2 * Math.PI)
  const arc = (x: number, y: number) => `A${radius} ${radius} 0 0 0 ${x} ${y}`
  return [
    `M${center} ${center + radius}`,
    arc(center + radius, center),
    arc(center, center - radius),
    arc(center - radius, center),
    arc(center, center + radius),
  ].join('')
}

function visual(slide: Root) {
  const [ring, ...others] = parts(slide)
  const svg = ring?.querySelector('svg')
  const center = (svg?.viewBox.baseVal.width ?? 0) / 2
  return {
    ring,
    others,
    // Bolinha do anel: gira em volta do centro e o anel é o rastro dela
    orbiter: ring ? all(ring, '[data-name="Ellipse 11"]') : [],
    dot: ring ? all(ring, '[data-name="Ellipse 11"] circle') : [],
    // Filtros (sombra interna) da bolinha do anel e da bolinha do Motion
    dotFilter: ring ? filterOf(ring, '[data-name="Ellipse 11"]') : undefined,
    motionFilter: filterOf(
      slide.parentElement,
      '[data-slide="motion"] [data-name="Ellipse 11"]'
    ),
    size: center * 2,
    track: ring
      ? all(ring, '[data-name="Ellipse 18"], [data-name="Ellipse 19"]')
      : [],
    core: ring
      ? all(ring, '[data-name="Ellipse 16"], [data-name="Ellipse 17"]')
      : [],
    origin: `${center} ${center}`,
    // Formas que se equilibram dentro dos círculos
    bars: all(slide, '[data-name="Rectangle 9"]'),
    tops: all(slide, '[data-name="Polygon 1"]'),
  }
}

// Na primeira volta a bolinha desenha o anel e assenta (power2.inOut). Depois,
// bolinha e anel giram juntos (o rastro acompanha a bolinha), acelerando aos
// poucos até uma volta a cada LAP segundos
const ORBIT = 2.2
const LAP = 10

const byStageX = (els: Element[]) =>
  [...els].sort((a, b) => stageBox(a).x - stageBox(b).x)

function enterVisual(slide: Root) {
  const v = visual(slide)
  const camera = CAMERA[layerOf(slide)]
  const tl = reset(slide)
  if (!v.ring) return tl

  const others = byStageX(v.others)
  const arrive = PAN_AT + PAN * 0.6

  // O anel começa onde a bolinha do Motion parou, girado -90° (a bolinha no topo)
  tl.set(v.ring, { ...shiftBy(v.ring, -camera.x, -camera.y), rotation: -90 }, 0)
    .set(
      v.track,
      {
        attr: { d: v.track[0] ? trailPath(v.track[0], v.size / 2) : '' },
        drawSVG: '0%',
        rotation: -90,
        svgOrigin: v.origin,
      },
      0
    )
    .set(v.core, { scale: 0, svgOrigin: v.origin }, 0)
    .set(v.orbiter, { rotation: -90, svgOrigin: v.origin }, 0)
    .set(v.dot, { scale: camera.dot, transformOrigin: '50% 50%' }, 0)
    .set(others, { scale: 0 }, 0)
    .set(
      [...v.bars, ...v.tops],
      { yPercent: -60, rotation: 0, autoAlpha: 0 },
      0
    )
    // 1. A bolinha continua o movimento e o anel é o rastro dela
    .to(
      [...v.orbiter, ...v.track],
      {
        rotation: 270,
        svgOrigin: v.origin,
        duration: ORBIT,
        ease: 'power2.inOut',
      },
      0
    )
    .to(v.track, { drawSVG: '100%', duration: ORBIT, ease: 'power2.inOut' }, 0)
    .to(v.dot, { scale: 1, duration: 0.6, ease: 'power2.inOut' }, 0)
    // 2. O núcleo dá pop enquanto o arco se forma
    .to(
      v.core,
      { scale: 1, svgOrigin: v.origin, duration: 0.5, ease: POP, stagger: 0.1 },
      ORBIT * 0.45
    )
    // 3. Câmera: o anel desliza (e endireita) até o seu lugar no Visual
    .to(
      v.ring,
      {
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        duration: PAN,
        ease: 'power3.inOut',
      },
      PAN_AT
    )
    // 4. Chegando, as outras formas dão pop da esquerda para a direita
    .to(others, { scale: 1, duration: 0.6, ease: POP, stagger: 0.12 }, arrive)

  // A sombra da bolinha do anel acompanha a da bolinha do Motion: na troca é
  // idêntica e, ao encolher, diminui na mesma proporção. A região do filtro é
  // fixa (userSpaceOnUse) e cortaria a bolinha ampliada, então é aberta
  const shade = shadeOf(v.dotFilter)
  const motionShade = shadeOf(v.motionFilter)
  if (v.dotFilter && shade && motionShade) {
    const at = (factor: number) => ({
      offset: { dx: motionShade.dx * factor, dy: motionShade.dy * factor },
      blur: { stdDeviation: motionShade.deviation * factor },
    })
    const start = at(1)
    const final = at(1 / camera.dot)
    tl.set(
      v.dotFilter,
      {
        attr: { x: -v.size, y: -v.size, width: v.size * 3, height: v.size * 3 },
      },
      0
    )
      .set(shade.offset, { attr: start.offset }, 0)
      .set(shade.blur, { attr: start.blur }, 0)
      .to(
        shade.offset,
        { attr: final.offset, duration: 0.6, ease: 'power2.inOut' },
        0
      )
      .to(
        shade.blur,
        { attr: final.blur, duration: 0.6, ease: 'power2.inOut' },
        0
      )
  }

  // As formas caem dentro dos círculos e se equilibram
  const settle = arrive + 0.35
  tl.to(
    [...v.bars, ...v.tops],
    {
      yPercent: 0,
      autoAlpha: 1,
      duration: 0.45,
      ease: 'power2.in',
      stagger: 0.08,
    },
    settle
  ).to(
    v.bars,
    {
      keyframes: [
        { rotation: 14, duration: 0.25, ease: 'power2.out' },
        { rotation: -9, duration: 0.3, ease: 'sine.inOut' },
        { rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)' },
      ],
      transformOrigin: '50% 100%',
    },
    settle + 0.4
  )

  // Bolinha e rastro voltam a girar juntos; power1.in termina com o dobro da
  // velocidade média, então o ângulo é metade de velocidade × tempo e o idle
  // continua sem tranco
  const ramp = Math.max(tl.duration() - ORBIT, 0.5)
  tl.to(
    [...v.orbiter, ...v.track],
    {
      rotation: `+=${(360 / LAP) * (ramp / 2)}`,
      svgOrigin: v.origin,
      duration: ramp,
      ease: 'power1.in',
    },
    ORBIT
  )

  return tl
}

function idleVisual(slide: Root, duration: number) {
  const v = visual(slide)
  const tl = gsap.timeline()

  // Bolinha e rastro continuam circulando o núcleo, na mesma velocidade
  tl.to(
    [...v.orbiter, ...v.track],
    {
      rotation: `+=${(360 * duration) / LAP}`,
      svgOrigin: v.origin,
      duration,
      ease: 'none',
    },
    0
  )
  // Gangorra leve das barras
  tl.to(
    v.bars,
    {
      rotation: 5,
      transformOrigin: '50% 100%',
      duration: duration / 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 3,
    },
    0
  )
  when(all(slide, '[data-float]'), (floats) =>
    tl.to(
      floats,
      {
        yPercent: -6,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
        stagger: { each: 0.25, from: 'random' },
      },
      0
    )
  )
  return hold(tl, duration)
}

function exitVisual(slide: Root) {
  return gsap.timeline().to(parts(slide), {
    scale: 0,
    duration: 0.5,
    ease: POP_OUT,
    stagger: 0.07,
  })
}

/* ---------------------------------------------------------- Experience */

function enterExperience(slide: Root) {
  const tl = reset(slide)
  const pieces = parts(slide)
  const lines = strokes(slide)

  // Estado inicial aplicado a todas as peças no primeiro frame: com stagger,
  // as últimas não podem aparecer prontas antes da vez delas
  tl.set(pieces, { scale: 0 }, 0)
    .set(lines, { drawSVG: '0%' }, 0)
    .to(pieces, { scale: 1, duration: 0.6, ease: POP, stagger: 0.1 }, 0)
    .to(
      lines,
      { drawSVG: '100%', duration: 0.6, ease: 'power1.inOut', stagger: 0.02 },
      0.35
    )

  return tl
}

// Tudo é jogado para a esquerda; o "a" do Polymath reaparece em seguida
function exitExperience(slide: Root) {
  return gsap.timeline().to(parts(slide), {
    xPercent: -900,
    duration: 0.85,
    ease: THROW,
    stagger: 0.06,
  })
}

/* --------------------------------------------------------------- Idle */

// Pausa genérica: peças flutuam e as marcadas com data-spin giram
function idleFloat(slide: Root, duration: number) {
  const floats = all(slide, '[data-float]')
  const spins = all(slide, '[data-spin]')
  const tl = gsap.timeline()

  when(floats, (t) =>
    tl.to(
      t,
      {
        yPercent: -6,
        duration: duration / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
        stagger: { each: 0.25, from: 'random' },
      },
      0
    )
  )
  when(spins, (t) =>
    tl.to(t, { rotation: 40, duration, ease: 'sine.inOut' }, 0)
  )
  return hold(tl, duration)
}

type SlideAnimation = {
  enter: (slide: Root) => gsap.core.Timeline
  idle: (slide: Root, duration: number) => gsap.core.Timeline
  exit: (slide: Root) => gsap.core.Timeline
  // Quanto do fim da saída corre junto com a próxima entrada
  handoff?: number
}

export const heroSlides: Record<HeroArtId, SlideAnimation> = {
  type: { enter: enterType, idle: idleType, exit: exitType },
  '3d': { enter: enter3d, idle: idle3d, exit: exit3d },
  motion: {
    enter: enterMotion,
    idle: idleMotion,
    exit: exitMotion,
    // O Visual nasce quando o rastro termina de sumir (mesmo movimento de câmera)
    handoff: PAN_AT + PAN,
  },
  visual: { enter: enterVisual, idle: idleVisual, exit: exitVisual },
  experience: { enter: enterExperience, idle: idleFloat, exit: exitExperience },
}

export { appearType }
