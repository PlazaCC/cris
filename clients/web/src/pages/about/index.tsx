import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { useAbout } from '@/features/about/hooks/use-about'
import { useGlobal } from '@/features/global/hooks/use-global'
import { AboutClients } from './components/clients'
import { AboutHero } from './components/hero'
import { AboutSkills } from './components/skills'

export function AboutPage() {
  const { data: global } = useGlobal()
  const { data: about, isLoading, error, refetch } = useAbout()

  // Mantém estrutura visual mesmo com erro/loading
  if (isLoading || error || !about) {
    return (
      <section className="mx-auto flex min-h-[80vh] max-w-[1440px] items-center justify-center px-5 py-8 lg:gap-[138px] lg:pr-10 lg:pl-[155px]">
        {isLoading && <LoadingState message="Carregando página About..." />}
        {error && (
          <ErrorState
            title="Não foi possível carregar o About"
            message="Verifique sua conexão e tente novamente."
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
