import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'

import { updateAbout } from '@/features/about/api'
import type { aboutInputSchema } from '@/features/about/schemas'

import { aboutQueryOptions } from './use-about'

export function useUpdateAbout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: z.infer<typeof aboutInputSchema>) =>
      updateAbout({ data }),
    onSuccess: (about) => {
      queryClient.setQueryData(aboutQueryOptions().queryKey, about)
    },
  })
}
