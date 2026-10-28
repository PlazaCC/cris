import MarqueeModule from 'react-fast-marquee'

// react-fast-marquee é CommonJS (`exports.default`): no SSR o import default
// chega como o objeto do módulo, então desembrulhamos o `default` aqui
type MarqueeComponent = typeof MarqueeModule

export const Marquee: MarqueeComponent =
  (MarqueeModule as unknown as { default?: MarqueeComponent }).default ??
  MarqueeModule
