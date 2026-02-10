import { createRoute } from '@tanstack/react-router'
import { AppLayout } from '../_layout'
import { AboutClients } from './components/clients'
import { AboutHero } from './components/hero'
import { AboutSkills } from './components/skills'

AboutPage.route = createRoute({
  path: '/about',
  component: AboutPage,
  getParentRoute: () => AppLayout.route,
})

export function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutClients />
      <AboutSkills />
    </>
  )
}
