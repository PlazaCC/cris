import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { useAbout } from '@/features/about/hooks/use-about'
import { useGlobal } from '@/features/global/hooks/use-global'
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
  const { data: global } = useGlobal()
  const { data: about, isLoading, error, refetch } = useAbout()

  // Mantém estrutura visual mesmo com erro/loading
  if (isLoading || error || !about) {
    return (
      <section className="mx-auto flex min-h-[80vh] max-w-[1440px] items-center justify-center gap-[138px] py-8 pr-10 pl-[155px]">
        {isLoading && <LoadingState message="Carregando página About..." />}
        {error && (
          <ErrorState
            title="Não foi possível carregar o About"
            message="Verifique se o Strapi está ativo e tente novamente."
            onRetry={() => {
              void refetch()
            }}
          />
        )}
        {!isLoading && !error && !about && (
          <ErrorState title="Conteúdo About não encontrado" />
        )}
      </section>
    )
  }

  return (
    <>
      <AboutHero
        siteName={global?.siteName ?? 'unk'}
        title={about.title}
        body={about.body}
        image={about.image}
      />
      <AboutClients clients={about.clients.map((client) => client.name)} />
      <AboutSkills skills={about.skills.map((skill) => skill.name)} />
    </>
  )
}
