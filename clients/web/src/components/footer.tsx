import { cn } from '@/lib/utils'

const footerLinks = [
  {
    title: 'E-mail',
    href: 'mailto:contato@plazacontabil.com.br',
  },
  {
    title: 'Linked In',
    href: 'mailto:contato@plazacontabil.com.br',
  },
  {
    title: 'Instagram',
    href: 'mailto:contato@plazacontabil.com.br',
  },
]

export const Footer = () => {
  return (
    <footer className="bg-blue w-full">
      <div className="m-auto flex max-w-[1210px] flex-col px-10 py-16">
        <div className="flex items-center justify-between">
          <h2 className="text-off-white text-[262px] font-bold">unk</h2>
          <ul className="flex w-[439px] flex-col">
            {footerLinks.map((link) => (
              <FooterLink key={link.title} href={link.href}>
                {link.title}
              </FooterLink>
            ))}
          </ul>
        </div>
        <div className="text-off-white flex w-full justify-between">
          <p>2025 - Crisriano c</p>
          <p>Colophon : Gabarito by Naipe</p>
        </div>
      </div>
    </footer>
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
