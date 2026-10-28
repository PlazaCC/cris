import type LocomotiveScroll from 'locomotive-scroll'

// Locomotive Scroll depende de `window`, então só é instanciado no cliente
let instance: LocomotiveScroll | null = null
let pending: Promise<LocomotiveScroll> | null = null

export function initSmoothScroll() {
  pending ??= import('locomotive-scroll').then(({ default: Locomotive }) => {
    instance = new Locomotive()
    return instance
  })

  return pending
}

export function getSmoothScroll() {
  return instance
}
