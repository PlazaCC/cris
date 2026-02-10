import { createRoute } from '@tanstack/react-router'
import { AppLayout } from '../_layout'

HomePage.route = createRoute({
  path: '/',
  component: HomePage,
  getParentRoute: () => AppLayout.route,
})

export function HomePage() {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center">
        <HomeHero />
      </div>
    </>
  )
}

export const HomeHero = () => {
  return (
    <div className="w-full px-10 pt-9 pb-[115px]">
      <div className="bg-off-white flex h-[830px] w-full flex-col gap-[400px] rounded-4xl p-[53px]">
        <span className="text-[32px] leading-[100%] font-bold text-black">
          unk
        </span>
        <div className="flex flex-col gap-16">
          <h1 className="text-[88px] leading-[98%]">
            <span className="after:bg-blue relative z-10 after:absolute after:bottom-[10px] after:left-0 after:-z-10 after:h-[8px] after:w-full after:content-['']">
              Polymath
            </span>{' '}
            designer, in a relationship with interactivity
          </h1>
          <p className="text-lg">
            Hi, I'm <span className="text-blue">Cris</span>, a multidisciplinary
            designer who combines different design approaches to
            <br />
            solve my clients' needs.
          </p>
        </div>
      </div>
    </div>
  )
}
