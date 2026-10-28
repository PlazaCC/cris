import { Theme, themeContext } from '@/contexts/theme/contex'
import { useEffect, useState } from 'react'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  // localStorage só existe no cliente; lê após a hidratação para evitar mismatch
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    // if (theme === 'system') {
    //   const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
    //     .matches
    //     ? 'dark'
    //     : 'light'

    //   root.classList.add(systemTheme)
    //   return
    // }

    // root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <themeContext.Provider {...props} value={value}>
      {children}
    </themeContext.Provider>
  )
}
