import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'

import { Router } from './router'

import { ThemeProvider } from './contexts/theme/provider'

import { StrictMode } from 'react'

import LocomotiveScroll from 'locomotive-scroll'

new LocomotiveScroll()

import './global.scss'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router />
      <Toaster position="top-center" />
    </ThemeProvider>
  </StrictMode>
)
