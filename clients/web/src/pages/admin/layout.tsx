import { getRouteApi, Link, Outlet, useRouter } from '@tanstack/react-router'
import {
  ExternalLink,
  FolderKanban,
  Globe,
  Image,
  Inbox,
  LogOut,
  Mail,
  PanelBottom,
  Tags,
  UserRound,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSignOut } from '@/features/auth/hooks/use-auth-actions'
import { countContactMessages } from '@/features/contact/filters'
import { useContactMessages } from '@/features/contact/hooks/use-contact-messages'
import { cn } from '@/lib/utils'

const route = getRouteApi('/admin/_panel')

const NAV = [
  { to: '/admin/messages', label: 'Mensagens', icon: Inbox },
  { to: '/admin/projects', label: 'Projetos', icon: FolderKanban },
  { to: '/admin/badges', label: 'Badges', icon: Tags },
  { to: '/admin/media', label: 'Mídia', icon: Image },
  { to: '/admin/global', label: 'Global', icon: Globe },
  { to: '/admin/about', label: 'About', icon: UserRound },
  { to: '/admin/footer', label: 'Footer', icon: PanelBottom },
  { to: '/admin/email', label: 'E-mail', icon: Mail },
] as const

const linkClass =
  'text-muted-foreground hover:bg-muted hover:text-foreground data-[status=active]:bg-muted data-[status=active]:text-foreground flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors'

// Painel sem Menu, Footer nem animações do site público
export function AdminLayout() {
  const { user } = route.useRouteContext()
  const router = useRouter()
  const signOut = useSignOut()

  return (
    <div className="bg-muted/40 text-foreground flex min-h-dvh flex-col font-sans md:flex-row">
      <aside className="bg-background flex flex-col gap-4 border-b p-3 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:border-r md:border-b-0 md:p-4">
        <div className="flex items-center justify-between gap-2 px-2 md:flex-col md:items-start">
          <Link to="/admin" className="text-lg font-semibold">
            Painel
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
          >
            Ver site <ExternalLink className="size-3" />
          </a>
        </div>

        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 md:flex-col">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={linkClass}>
              <Icon className="size-4" />
              {label}
              {to === '/admin/messages' && <MessagesBadge />}
            </Link>
          ))}
        </nav>

        <div className="mt-auto hidden flex-col gap-2 border-t pt-4 md:flex">
          <p className="truncate px-2 text-xs" title={user.email}>
            {user.email}
          </p>
          <Button
            variant="ghost"
            className="justify-start"
            disabled={signOut.isPending}
            onClick={() =>
              signOut.mutate(undefined, {
                onSuccess: () => router.navigate({ to: '/admin/login' }),
              })
            }
          >
            <LogOut />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-8">
        <Outlet />
        <Button
          variant="ghost"
          className="self-start md:hidden"
          disabled={signOut.isPending}
          onClick={() =>
            signOut.mutate(undefined, {
              onSuccess: () => router.navigate({ to: '/admin/login' }),
            })
          }
        >
          <LogOut />
          Sair ({user.email})
        </Button>
      </main>
    </div>
  )
}

// Não lidas no menu; vermelho quando algum e-mail de aviso falhou
function MessagesBadge() {
  const { data } = useContactMessages()
  if (!data) return null

  const { unread, failed } = countContactMessages(data)
  if (!unread && !failed) return null

  return (
    <span
      className={cn(
        'ml-auto rounded-full px-1.5 text-xs leading-5 font-semibold tabular-nums',
        failed
          ? 'bg-destructive text-white'
          : 'bg-primary text-primary-foreground'
      )}
      title={
        failed
          ? `${failed} sem e-mail enviado`
          : `${unread} não lida${unread > 1 ? 's' : ''}`
      }
    >
      {failed || unread}
    </span>
  )
}
