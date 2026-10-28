import { Link, useLocation } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useEffect, useId, useState } from 'react'

import closeIcon from '@/assets/icons/close.svg'
import menuIcon from '@/assets/icons/menu.svg'
import { ContactDialog } from '@/components/contact-dialog'
import { findMenuItem, menuItems } from '@/lib/menu-items'
import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/stores/navigation-store'

const anim = (variants: Variants) => {
  return {
    variants,
    initial: 'initial',
    animate: 'enter',
    exit: 'exit',
  }
}

const navbarVariants: Variants = {
  initial: {
    y: 100,
    opacity: 1,
  },
  enter: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.2,
    },
  },
  exit: {
    y: 100,
    opacity: 0,
  },
}

const morph = { type: 'spring', stiffness: 380, damping: 34 } as const

// Item ativo: /work/$slug continua marcando "work"
function useActiveItem() {
  const { pathname } = useLocation()
  return findMenuItem(pathname)
}

export const Menu = () => (
  <>
    <DesktopMenu />
    <MobileMenu />
  </>
)

function DesktopMenu() {
  const canNavigate = useNavigationStore((state) => state.canNavigate)
  const activeItem = useActiveItem()?.label

  return (
    <motion.nav
      className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black backdrop-blur-sm max-md:hidden"
      {...anim(navbarVariants)}
    >
      {/* list */}
      <ul className="relative z-10 flex items-center gap-2 p-2">
        {menuItems.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            // O AnimatedOutlet volta ao topo quando a página nova monta
            resetScroll={false}
            disabled={!canNavigate}
          >
            <li
              className={cn(
                'relative cursor-pointer rounded-full px-4 py-3 transition-all duration-200',
                'hover:bg-white/10',
                'active:bg-white/30',
                activeItem === label && 'pointer-events-none',
                !canNavigate && 'pointer-events-none'
              )}
            >
              {activeItem === label && (
                <motion.div
                  className="absolute inset-0 z-0 rounded-full bg-white"
                  layoutId="menu-cursor"
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}

              <p
                className={cn(
                  'relative z-10 text-white',
                  activeItem === label && 'text-black'
                )}
              >
                {label}
              </p>
            </li>
          </Link>
        ))}

        <li>
          <GetInTouch className="px-4 py-2" />
        </li>
      </ul>
    </motion.nav>
  )
}

/*
 * Mobile: uma pílula com a página atual ("≡ About") que abre o painel com
 * todas as páginas. Pílula e painel compartilham o layoutId, então um vira o
 * outro. Fecha ao navegar, no "Close", no Esc e tocando fora.
 */
function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const canNavigate = useNavigationStore((state) => state.canNavigate)
  const active = useActiveItem()
  const panelId = useId()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <motion.div
      className="fixed inset-x-2 bottom-2 z-10 flex justify-center md:hidden"
      {...anim(navbarVariants)}
    >
      <AnimatePresence>
        {open && (
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 -z-10 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.nav
            key="panel"
            id={panelId}
            layoutId="mobile-menu"
            transition={morph}
            style={{ borderRadius: 38 }}
            className="flex w-full flex-col gap-1 bg-black p-2"
          >
            {menuItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                resetScroll={false}
                disabled={!canNavigate}
                aria-current={active?.path === path ? 'page' : undefined}
                className={cn(
                  'text-off-white flex min-h-[60px] items-center justify-center rounded-full px-2 text-lg capitalize',
                  'active:bg-white/10'
                )}
              >
                <FadeIn>{label}</FadeIn>
              </Link>
            ))}
            <GetInTouch className="min-h-[60px] justify-center px-2 text-lg">
              Get in touch
            </GetInTouch>
            <button
              type="button"
              aria-expanded
              aria-controls={panelId}
              className="flex min-h-[60px] items-center justify-center rounded-full px-2 active:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <FadeIn className="flex items-center gap-2.5 px-4 py-3">
                <Glyph src={closeIcon} />
                <span className="text-off-white text-lg">Close</span>
              </FadeIn>
            </button>
          </motion.nav>
        ) : (
          <motion.button
            key="pill"
            type="button"
            aria-expanded={false}
            aria-controls={panelId}
            layoutId="mobile-menu"
            transition={morph}
            style={{ borderRadius: 999 }}
            className="flex items-center gap-2.5 bg-black px-6 py-3.5"
            onClick={() => setOpen(true)}
          >
            <FadeIn className="flex items-center gap-2.5">
              <Glyph src={menuIcon} />
              <span className="text-off-white text-lg capitalize">
                {active?.label ?? 'menu'}
              </span>
            </FadeIn>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Conteúdo entra depois do morph começar, para não esticar junto com a caixa
function FadeIn({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.12 } }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
    >
      {children}
    </motion.span>
  )
}

// Ícone do Figma centralizado na caixa de 32px
function Glyph({ src }: { src: string }) {
  return (
    <span className="flex size-8 items-center justify-center" aria-hidden>
      <img src={src} alt="" className="block" />
    </span>
  )
}

function GetInTouch({
  className,
  children = 'get in touch',
}: {
  className?: string
  children?: React.ReactNode
}) {
  const canNavigate = useNavigationStore((state) => state.canNavigate)

  return (
    <ContactDialog>
      <button
        type="button"
        className={cn(
          'flex cursor-pointer items-center gap-2.5 rounded-full text-white hover:bg-white/10 active:bg-white/30',
          !canNavigate && 'pointer-events-none',
          className
        )}
      >
        <span className="whitespace-nowrap">{children}</span>
        <motion.span
          className="bg-blue flex size-8 items-center justify-center rounded-full"
          whileHover={{ rotate: -45 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <ArrowRight className="size-4" />
        </motion.span>
      </button>
    </ContactDialog>
  )
}
