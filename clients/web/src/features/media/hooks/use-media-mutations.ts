import { useMutation, useQueryClient } from '@tanstack/react-query'
import { upload } from '@vercel/blob/client'

import { deleteMedia, registerMedia } from '@/features/media/api'

import { mediaQueryOptions } from './use-media'

/*
 * Sobe direto do navegador para o Blob (o token vem de /api/upload) e depois
 * registra a URL na biblioteca. Devolve os itens na ordem dos arquivos.
 */
export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (files: File[]) =>
      Promise.all(
        files.map(async (file) => {
          const blob = await upload(`media/${file.name}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          })
          return registerMedia({ data: { url: blob.url } })
        })
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaQueryOptions().queryKey }),
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMedia({ data: { id } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: mediaQueryOptions().queryKey }),
  })
}
