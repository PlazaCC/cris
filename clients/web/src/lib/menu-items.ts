export type MenuItem = {
  path: string
  label: string
}

// A ordem do menu também é a ordem espacial das páginas: a transição padrão
// desliza para a esquerda ao avançar nela e para a direita ao voltar
export const menuItems: MenuItem[] = [
  { path: '/', label: 'intro' },
  { path: '/about', label: 'about' },
  { path: '/work', label: 'work' },
]

// /work/$slug continua sendo "work"
export function findMenuItem(pathname: string) {
  return menuItems.find(({ path }) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )
}

// 1 = avança no menu (ou fica na mesma seção, como projeto → próximo projeto);
// -1 = volta
export function menuDirection(from: string, to: string): 1 | -1 {
  const fromItem = findMenuItem(from)
  const toItem = findMenuItem(to)
  if (!fromItem || !toItem) return 1
  return menuItems.indexOf(toItem) < menuItems.indexOf(fromItem) ? -1 : 1
}
