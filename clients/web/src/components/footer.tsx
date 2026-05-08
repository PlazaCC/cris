import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'
import { useFooter } from '@/features/footer/hooks/use-footer'
import type { SocialLink } from '@/interfaces'
import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/stores/navigation-store'
import { motion } from 'framer-motion'

export const Footer = () => {
  const canNavigate = useNavigationStore((state) => state.canNavigate)
  const { data: footer, isLoading, error, refetch } = useFooter()

  return (
    <div className="overflow-hidden">
      <motion.footer
        className="bg-blue w-full"
        animate={{
          opacity: canNavigate ? 1 : 0,
          translateY: canNavigate ? 0 : '100%',
        }}
        transition={{
          opacity: {
            duration: 0.5,
            ease: 'linear',
          },
          translateY: {
            duration: 0.5,
            ease: [0.4, 0, 0.6, 0.2],
          },
        }}
      >
        <div className="m-auto flex max-w-[1210px] flex-col px-10 py-16">
          {isLoading || error || !footer ? (
            <div className="flex min-h-[240px] items-center justify-center">
              {isLoading && <LoadingState message="Carregando footer..." />}
              {error && (
                <ErrorState
                  title="Não foi possível carregar o footer"
                  message="Verifique se o Strapi está ativo e tente novamente."
                  onRetry={() => {
                    void refetch()
                  }}
                />
              )}
              {!isLoading && !error && !footer && (
                <ErrorState title="Conteúdo do footer não encontrado" />
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <motion.h2
                  className="text-off-white text-[262px] font-bold"
                  animate={{
                    translateY: canNavigate ? 0 : '-50%',
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0,
                    ease: [0.6, 0, 0.8, 0.2],
                  }}
                >
                  {footer.brand}
                </motion.h2>
                <motion.ul
                  className="flex w-[439px] flex-col"
                  animate={{
                    translateY: canNavigate ? 0 : '-50%',
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0,
                    ease: [0.6, 0, 0.8, 0.2],
                  }}
                >
                  {footer.links.map((link: SocialLink) => (
                    <FooterLink key={link.title} href={link.url}>
                      {link.title}
                    </FooterLink>
                  ))}
                </motion.ul>
              </div>
              <motion.div
                className="text-off-white flex w-full justify-between"
                animate={{
                  translateY: canNavigate ? 0 : '-200%',
                }}
                transition={{
                  duration: 0.5,
                  delay: 0,
                  ease: [0.6, 0, 0.8, 0.2],
                }}
              >
                <p>
                  {footer.year} - {footer.copyright}
                </p>
                {footer.colophon && <p>{footer.colophon}</p>}
              </motion.div>
            </>
          )}
        </div>
      </motion.footer>
    </div>
  )
}

export const FooterLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => {
  return (
    <li className="w-full">
      <a
        className={cn(
          'footerLink',
          'text-off-white relative flex w-full overflow-hidden border-b py-8',
          'after:bg-off-white path clip-path after:absolute after:top-0 after:h-full after:w-full after:opacity-50 after:transition-all after:duration-300 after:ease-in-out after:content-[""] hover:after:opacity-100'
        )}
        href={href}
      >
        {children}
      </a>
    </li>
  )
}
