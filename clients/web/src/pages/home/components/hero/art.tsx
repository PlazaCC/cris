import type { ComponentType } from 'react'

import { InlineSvg } from '@/components/ui/inline-svg'

import d3dStackBack from '@/assets/hero/desktop/3d-stack-back.svg?raw'
import d3dStackFront from '@/assets/hero/desktop/3d-stack-front.svg?raw'
import dMotionArcLeft from '@/assets/hero/desktop/motion-arc-left.svg?raw'
import dMotionArcRight from '@/assets/hero/desktop/motion-arc-right.png'
import dMotionBall from '@/assets/hero/desktop/motion-ball.svg?raw'
import dMotionTrail from '@/assets/hero/desktop/motion-trail.svg?raw'
import dTypeGlyph from '@/assets/hero/desktop/type-glyph.svg?raw'
import dUxDocument from '@/assets/hero/desktop/ux-document.svg?raw'
import dUxFlow from '@/assets/hero/desktop/ux-flow.svg?raw'
import dUxPie from '@/assets/hero/desktop/ux-pie.svg?raw'
import dUxProfile from '@/assets/hero/desktop/ux-profile.svg?raw'
import dVisualCircleLarge from '@/assets/hero/desktop/visual-circle-large.svg?raw'
import dVisualCircleSmall from '@/assets/hero/desktop/visual-circle-small.svg?raw'
import dVisualRing from '@/assets/hero/desktop/visual-ring.svg?raw'
import m3dStackBack from '@/assets/hero/mobile/3d-stack-back.svg?raw'
import m3dStackFront from '@/assets/hero/mobile/3d-stack-front.svg?raw'
import mMotion from '@/assets/hero/mobile/motion.svg?raw'
import mTypeGlyph from '@/assets/hero/mobile/type-glyph.svg?raw'
import mUxDocument from '@/assets/hero/mobile/ux-document.svg?raw'
import mUxFlow from '@/assets/hero/mobile/ux-flow.svg?raw'
import mUxPie from '@/assets/hero/mobile/ux-pie.svg?raw'
import mUxProfile from '@/assets/hero/mobile/ux-profile.svg?raw'
import mVisualCircleLarge from '@/assets/hero/mobile/visual-circle-large.svg?raw'
import mVisualCircleSmall from '@/assets/hero/mobile/visual-circle-small.svg?raw'
import mVisualRing from '@/assets/hero/mobile/visual-ring.svg?raw'

import { place, scaled } from './stage'

/*
 * Ilustrações das disciplinas, posicionadas com as coordenadas dos frames do
 * Figma (Desktop: type 63:67, 3d 45:15, Motion 56:38, Visual 60:14, UX 60:27;
 * Mobile: 146:1372, 146:1365, 146:1358, 146:1351, 146:1325).
 *
 * Atributos `data-*` são os ganchos das animações (ver animations.ts):
 *   data-piece  — peça que entra com fade/escala
 *   data-draw   — SVG cujos traços são desenhados com DrawSVG
 *   data-float  — peça que flutua durante a pausa
 *   data-spin   — peça que gira durante a pausa
 */

type CapsuleProps = {
  box: [x: number, y: number, width: number, height: number]
  size: [width: number, height: number]
  tone: 'blue' | 'navy'
  shadowBlur: number
}

const capsuleGradient = {
  blue: 'linear-gradient(191.085deg, rgb(10, 76, 255) 19.947%, rgba(189, 207, 255, 0) 110.42%)',
  navy: 'linear-gradient(186.354deg, rgb(0, 18, 67) 19.947%, rgba(0, 44, 162, 0) 110.42%)',
}

// Pílulas do Visual (61:77–61:79) são HTML no Figma, não SVG
function Capsule({ box, size, tone, shadowBlur }: CapsuleProps) {
  return (
    <div
      data-piece
      data-float
      className="flex items-center justify-center"
      style={place(...box)}
    >
      <div
        className="flex-none -rotate-[22.21deg] rounded-full"
        style={{
          width: scaled(size[0]),
          height: scaled(size[1]),
          backgroundImage: capsuleGradient[tone],
          boxShadow: `inset 0 0 ${scaled(shadowBlur)} 0 #0936af`,
        }}
      />
    </div>
  )
}

function TypeDesktop() {
  return (
    <div data-draw style={place(341.94, 62.95, 596.298, 773.024)}>
      <InlineSvg svg={dTypeGlyph} scope="hero-d-type" className="h-full" />
    </div>
  )
}

function TypeMobile() {
  return (
    <div data-draw style={place(30, 54.02, 300, 382.935)}>
      <InlineSvg svg={mTypeGlyph} scope="hero-m-type" className="h-full" />
    </div>
  )
}

function ThreeDDesktop() {
  return (
    <>
      <div data-stack style={place(458, 218.25, 357.745, 479.902)}>
        <InlineSvg
          svg={d3dStackBack}
          scope="hero-d-3d-back"
          className="h-full"
        />
      </div>
      <div data-stack style={place(545.25, 131, 357.745, 479.902)}>
        <InlineSvg
          svg={d3dStackFront}
          scope="hero-d-3d-front"
          className="h-full"
        />
      </div>
    </>
  )
}

function ThreeDMobile() {
  return (
    <>
      <div data-stack style={place(30, 108.41, 241.176, 323.529)}>
        <InlineSvg
          svg={m3dStackBack}
          scope="hero-m-3d-back"
          className="h-full"
        />
      </div>
      <div data-stack style={place(88.82, 49.59, 241.177, 323.529)}>
        <InlineSvg
          svg={m3dStackFront}
          scope="hero-m-3d-front"
          className="h-full"
        />
      </div>
    </>
  )
}

// Caixas com inset negativo no Figma (-5.24% / -0.66%) já convertidas para o tamanho real do asset
function MotionDesktop() {
  return (
    <>
      <div data-draw style={place(-75, -6, 836, 482)}>
        <InlineSvg
          svg={dMotionTrail}
          scope="hero-d-motion-trail"
          className="h-full"
        />
      </div>
      <div data-draw style={place(-75, -6, 482, 482)}>
        <InlineSvg
          svg={dMotionArcLeft}
          scope="hero-d-motion-arc"
          className="h-full"
        />
      </div>
      <img
        data-reveal
        alt=""
        aria-hidden="true"
        src={dMotionArcRight}
        className="max-w-none"
        style={place(380.5, 95.5, 383, 380.5)}
      />
      <div style={place(738, 76, 44, 44)}>
        <InlineSvg
          svg={dMotionBall}
          scope="hero-d-motion-ball"
          className="h-full"
        />
      </div>
    </>
  )
}

function MotionMobile() {
  return (
    <div data-draw style={place(-64, 39.28, 348, 195.269)}>
      <InlineSvg svg={mMotion} scope="hero-m-motion" className="h-full" />
    </div>
  )
}

function VisualDesktop() {
  return (
    <>
      <div data-piece data-spin style={place(112, 79, 174, 174)}>
        <InlineSvg
          svg={dVisualRing}
          scope="hero-d-visual-ring"
          className="h-full"
        />
      </div>
      <div data-piece data-float style={place(407, 194, 210, 210)}>
        <InlineSvg
          svg={dVisualCircleSmall}
          scope="hero-d-visual-small"
          className="h-full"
        />
      </div>
      <div data-piece data-float style={place(994, 8, 316, 316)}>
        <InlineSvg
          svg={dVisualCircleLarge}
          scope="hero-d-visual-large"
          className="h-full"
        />
      </div>
      <Capsule
        box={[801.72, 337.62, 123.246, 105.995]}
        size={[103.658, 72.167]}
        tone="blue"
        shadowBlur={16.8}
      />
      <Capsule
        box={[747.16, 204, 123.246, 105.995]}
        size={[103.658, 72.167]}
        tone="blue"
        shadowBlur={16.8}
      />
      <Capsule
        box={[738, 255.93, 196.132, 135.754]}
        size={[182.385, 72.167]}
        tone="navy"
        shadowBlur={16.8}
      />
    </>
  )
}

function VisualMobile() {
  return (
    <>
      <div data-piece data-spin style={place(6, 136.77, 55.801, 55.801)}>
        <InlineSvg
          svg={mVisualRing}
          scope="hero-m-visual-ring"
          className="h-full"
        />
      </div>
      <div data-piece data-float style={place(82.01, 173.65, 67.347, 67.347)}>
        <InlineSvg
          svg={mVisualCircleSmall}
          scope="hero-m-visual-small"
          className="h-full"
        />
      </div>
      <div data-piece data-float style={place(252.66, 114, 101.341, 101.341)}>
        <InlineSvg
          svg={mVisualCircleLarge}
          scope="hero-m-visual-large"
          className="h-full"
        />
      </div>
      <Capsule
        box={[189.99, 219.71, 39.525, 33.992]}
        size={[33.243, 23.144]}
        tone="blue"
        shadowBlur={5.388}
      />
      <Capsule
        box={[172.49, 176.86, 39.525, 33.992]}
        size={[33.243, 23.144]}
        tone="blue"
        shadowBlur={5.388}
      />
      <Capsule
        box={[169.56, 193.51, 62.899, 43.536]}
        size={[58.491, 23.144]}
        tone="navy"
        shadowBlur={5.388}
      />
    </>
  )
}

function ExperienceDesktop() {
  return (
    <>
      <div data-piece data-draw style={place(131.5, 103.5, 182, 266)}>
        <InlineSvg svg={dUxFlow} scope="hero-d-ux-flow" className="h-full" />
      </div>
      <div data-piece data-spin style={place(427, 275, 143, 143)}>
        <InlineSvg svg={dUxPie} scope="hero-d-ux-pie" className="h-full" />
      </div>
      <div data-piece data-draw style={place(717, 167.16, 154.623, 181.832)}>
        <InlineSvg
          svg={dUxDocument}
          scope="hero-d-ux-document"
          className="h-full"
        />
      </div>
      <div data-piece data-float style={place(1089, 203, 154.623, 181.832)}>
        <InlineSvg
          svg={dUxProfile}
          scope="hero-d-ux-profile"
          className="h-full"
        />
      </div>
    </>
  )
}

function ExperienceMobile() {
  return (
    <>
      <div data-piece data-draw style={place(6, 105, 85.821, 125.431)}>
        <InlineSvg svg={mUxFlow} scope="hero-m-ux-flow" className="h-full" />
      </div>
      <div data-piece data-spin style={place(111.15, 185.63, 67.431, 67.431)}>
        <InlineSvg svg={mUxPie} scope="hero-m-ux-pie" className="h-full" />
      </div>
      <div data-piece data-draw style={place(197.92, 134.78, 72.911, 85.742)}>
        <InlineSvg
          svg={mUxDocument}
          scope="hero-m-ux-document"
          className="h-full"
        />
      </div>
      <div data-piece data-float style={place(285.63, 151.68, 72.911, 85.742)}>
        <InlineSvg
          svg={mUxProfile}
          scope="hero-m-ux-profile"
          className="h-full"
        />
      </div>
    </>
  )
}

export type HeroArt = {
  Desktop: ComponentType
  Mobile: ComponentType
}

export const heroArt = {
  type: { Desktop: TypeDesktop, Mobile: TypeMobile },
  '3d': { Desktop: ThreeDDesktop, Mobile: ThreeDMobile },
  motion: { Desktop: MotionDesktop, Mobile: MotionMobile },
  visual: { Desktop: VisualDesktop, Mobile: VisualMobile },
  experience: { Desktop: ExperienceDesktop, Mobile: ExperienceMobile },
} satisfies Record<string, HeroArt>

export type HeroArtId = keyof typeof heroArt
