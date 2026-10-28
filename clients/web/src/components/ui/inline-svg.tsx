import { useMemo, type CSSProperties } from 'react'

import { scopeSvgIds } from '@/lib/svg'
import { cn } from '@/lib/utils'

type InlineSvgProps = {
  svg: string
  scope: string
  className?: string
  style?: CSSProperties
}

export function InlineSvg({ svg, scope, className, style }: InlineSvgProps) {
  const html = useMemo(() => scopeSvgIds(svg, scope), [svg, scope])

  return (
    <span
      aria-hidden="true"
      className={cn(
        'block [&>svg]:size-full [&>svg]:overflow-visible',
        className
      )}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
