import { rootRoute } from '@/pages/root'
import { createRoute } from '@tanstack/react-router'
import { AboutClients } from './components/clients'
import { AboutHero } from './components/hero'
import { AboutSkills } from './components/skills'

AboutPage.route = createRoute({
  path: '/about',
  component: AboutPage,
  getParentRoute: () => rootRoute,
})

export function AboutPage() {
  return (
    <div>
      <AboutHero />
      <AboutClients />
      <AboutSkills />
    </div>
  )
}
