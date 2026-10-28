import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  // Vite só expõe VITE_* em import.meta.env; o código de servidor lê process.env
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [
      // devtools() precisa ser o primeiro plugin
      devtools(),
      tsconfigPaths(),
      tanstackStart(),
      // Nitro gera o servidor de produção; na Vercel o preset é detectado automaticamente
      nitro(),
      // react() precisa vir depois de tanstackStart()
      react(),
      tailwindcss(),
    ],
    server: {
      host: true,
      port: 4000,
    },
  }
})
