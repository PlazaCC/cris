import { createFileRoute } from '@tanstack/react-router'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

import { auth } from '@/server/auth'

const MAX_SIZE = 20 * 1024 * 1024

/*
 * Gera o token para o navegador subir a imagem direto para o Vercel Blob,
 * sem passar pelo limite de 4,5 MB de body das functions da Vercel. O
 * registro em `media` é feito depois pelo próprio painel (registerMedia),
 * o que também funciona em localhost, onde o webhook do Blob não chega.
 */
export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as HandleUploadBody

        try {
          const result = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
              const session = await auth.api.getSession({
                headers: request.headers,
              })

              if (!session) {
                throw new Error('Não autorizado')
              }

              return {
                allowedContentTypes: ['image/*'],
                maximumSizeInBytes: MAX_SIZE,
                addRandomSuffix: true,
              }
            },
          })

          return Response.json(result)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Falha no upload'
          const status = message === 'Não autorizado' ? 401 : 400
          return Response.json({ error: message }, { status })
        }
      },
    },
  },
})
