import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import { Router } from './router'

import { ThemeProvider } from './contexts/theme/provider'

import './index.css'
import { StrictMode } from 'react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Router />
    <Toaster position="top-center" />
  </ThemeProvider>
  </StrictMode>
)
