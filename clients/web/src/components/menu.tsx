import { cn } from '@/lib/utils'
import { useNavigationStore } from '@/stores/navigation-store'
import { Link, useLocation } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { motion, Variants } from 'motion/react'

type MenuItem = {
  path: string
  label: string
}

const anim = (variants: Variants) => {
  return {
    variants,
    initial: 'initial',
    animate: 'enter',
    exit: 'exit',
  }
}

const menuItems: MenuItem[] = [
  { path: '/', label: 'intro' },
  { path: '/about', label: 'about' },
  { path: '/work', label: 'work' },
]

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

export const Menu = () => {
  const { pathname } = useLocation()
  const canNavigate = useNavigationStore((state) => state.canNavigate)

  const activeItem = menuItems.find((item) => item.path === pathname)?.label

  return (
    <motion.nav
      className="fixed bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black backdrop-blur-sm"
      {...anim(navbarVariants)}
    >
      {/* list */}
      <ul className="relative z-10 flex items-center gap-2 p-2">
        {menuItems.map(({ path, label }) => (
          <Link key={path} to={path} disabled={!canNavigate}>
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

        {/* Botão Get in Touch */}
        <li
          className={cn(
            'flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2 text-white hover:bg-white/10 active:bg-white/30',
            !canNavigate && 'pointer-events-none'
          )}
        >
          <p>get in touch</p>
          <motion.div
            className={cn(
              'bg-blue flex size-8 items-center justify-center rounded-full'
            )}
            whileHover={{ rotate: -45 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <ArrowRight className="size-4" />
          </motion.div>
        </li>
      </ul>
    </motion.nav>
  )
}
