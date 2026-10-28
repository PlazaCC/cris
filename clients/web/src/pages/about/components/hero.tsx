import { motion } from 'framer-motion'

import { revealItem } from '@/components/page-transition/reveal'
import { ResponsiveImageView } from '@/components/ui/responsive-image'
import type { ResponsiveImage } from '@/interfaces'

type AboutHeroProps = {
  siteName: string
  title: string
  body: string
  image: ResponsiveImage
}

// Mobile: texto e imagem empilhados; a partir do lg, lado a lado. Os blocos
// entram em ordem na troca de página (revealItem)
export const AboutHero = ({ siteName, title, body, image }: AboutHeroProps) => {
  return (
    <section className="mx-auto flex max-w-[1440px] flex-col gap-16 px-5 pt-4 pb-8 lg:flex-row lg:gap-[138px] lg:py-8 lg:pr-10 lg:pl-[155px]">
      <div className="flex flex-1 flex-col gap-16 text-[32px] leading-[100%] font-bold lg:gap-[155px]">
        <motion.span className="text-black" variants={revealItem}>
          {siteName}
        </motion.span>
        <div className="flex flex-col gap-8 lg:gap-16">
          <motion.h1
            className="text-dark-black text-5xl leading-[98%] font-bold lg:text-[66px]"
            variants={revealItem}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-dark-black text-lg font-normal whitespace-pre-line lg:font-bold"
            variants={revealItem}
          >
            {body}
          </motion.p>
        </div>
      </div>
      <motion.div
        className="bg-blue h-[436px] overflow-hidden rounded-[32px] lg:h-[811px] lg:flex-1"
        variants={revealItem}
      >
        <ResponsiveImageView
          alt={title}
          fetchPriority="high"
          image={image}
          imgClassName="h-full w-full object-cover"
          loading="eager"
        />
      </motion.div>
    </section>
  )
}
