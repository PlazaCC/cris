import { forwardRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

// Compartilhado com a réplica invisível do SharedCoverOverlay, que mede onde a
// capa vai parar antes da página do projeto existir
export const projectHeaderClassName =
  'm-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-5 pt-4 lg:gap-12 lg:px-10 lg:pt-[35px]'

type ProjectCoverFrameProps = {
  siteName: string
  className?: string
  children?: ReactNode
}

// Nome do site + moldura da capa; o ref aponta para a moldura
export const ProjectCoverFrame = forwardRef<
  HTMLDivElement,
  ProjectCoverFrameProps
>(({ siteName, className, children }, ref) => (
  <div className="relative flex w-full flex-col gap-[22px] lg:block">
    <span className="text-[32px] leading-[100%] font-bold text-black lg:absolute lg:top-[53px] lg:left-[115px] lg:z-10">
      {siteName}
    </span>
    <div
      ref={ref}
      className={cn(
        'h-[430px] w-full overflow-hidden rounded-lg lg:h-[658px] lg:rounded-[32px]',
        className
      )}
    >
      {children}
    </div>
  </div>
))
