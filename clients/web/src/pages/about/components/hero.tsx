import type { ResponsiveImage } from '@/interrfaces'
import { ResponsiveImageView } from '../../../components/ui/responsive-image'

type AboutHeroProps = {
  siteName: string
  title: string
  body: string
  image: ResponsiveImage
}

export const AboutHero = ({ siteName, title, body, image }: AboutHeroProps) => {
  return (
    <section className="mx-auto flex max-w-[1440px] gap-[138px] py-8 pr-10 pl-[155px]">
      <div className="flex flex-1 flex-col gap-[155px] text-[32px] leading-[100%] font-bold">
        <span className="text-black">{siteName}</span>
        <div className="flex flex-col gap-16">
          <h1 className="text-dark-black text-[66px] leading-[98%] font-bold">
            {title}
          </h1>
          <p className="text-dark-black text-lg whitespace-pre-line">{body}</p>
        </div>
      </div>
      <div className="bg-blue h-[811px] flex-1 overflow-hidden rounded-[32px]">
        <ResponsiveImageView
          alt={title}
          fetchPriority="high"
          image={image}
          imgClassName="h-full w-full object-cover"
          loading="eager"
        />
      </div>
    </section>
  )
}
