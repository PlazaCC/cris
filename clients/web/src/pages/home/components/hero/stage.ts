import type { CSSProperties } from 'react'

/**
 * Coordenadas das ilustrações vêm do Figma em px de um quadro fixo
 * (desktop 1360×830, mobile 360×690). O palco escala esse quadro para caber
 * no card usando container query units:
 *
 *   --u  = 1px do Figma, no tamanho atual do card
 *   --ox = deslocamento horizontal para centralizar o quadro
 *
 * O elemento com `stageVars()` precisa estar dentro de um ancestral com
 * `container-type: size`.
 */
export const DESKTOP_FRAME = { width: 1360, height: 830 }
export const MOBILE_FRAME = { width: 360, height: 690 }

type Frame = typeof DESKTOP_FRAME

export function stageVars(frame: Frame): CSSProperties {
  return {
    '--u': `min(calc(100cqw / ${frame.width}), calc(100cqh / ${frame.height}))`,
    '--ox': `calc((100cqw - ${frame.width} * var(--u)) / 2)`,
  } as CSSProperties
}

const px = (value: number) => `calc(${value} * var(--u))`

export function place(
  x: number,
  y: number,
  width: number,
  height: number
): CSSProperties {
  return {
    position: 'absolute',
    left: `calc(var(--ox) + ${x} * var(--u))`,
    top: px(y),
    width: px(width),
    height: px(height),
  }
}

export const scaled = px
