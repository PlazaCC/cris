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
        <div className="m-auto flex max-w-[1210px] flex-col gap-[30px] px-5 py-16 lg:gap-0 lg:px-10">
          {isLoading || error || !footer ? (
            <div className="flex min-h-[240px] items-center justify-center">
              {isLoading && <LoadingState message="Carregando footer..." />}
              {error && (
                <ErrorState
                  title="Não foi possível carregar o footer"
                  message="Verifique sua conexão e tente novamente."
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
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
                <motion.h2
                  className="text-off-white text-[min(222px,calc((100vw-40px)*0.6))] leading-none font-bold lg:text-[262px] lg:leading-normal"
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
                  className="flex w-full flex-col lg:w-[439px]"
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
                className="text-off-white flex w-full flex-col gap-2.5 text-sm lg:flex-row lg:justify-between lg:gap-0 lg:text-base"
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
          'text-off-white relative flex w-full overflow-hidden border-b py-4 text-sm lg:py-8 lg:text-base',
          'after:bg-off-white path clip-path after:absolute after:top-0 after:h-full after:w-full after:opacity-50 after:transition-all after:duration-300 after:ease-in-out after:content-[""] hover:after:opacity-100'
        )}
        href={href}
      >
        {children}
      </a>
    </li>
  )
}
