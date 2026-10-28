import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'

import { updateFooter } from '@/features/footer/api'
import type { footerInputSchema } from '@/features/footer/schemas'

import { footerQueryOptions } from './use-footer'

export function useUpdateFooter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: z.infer<typeof footerInputSchema>) =>
      updateFooter({ data }),
    onSuccess: (footer) => {
      queryClient.setQueryData(footerQueryOptions().queryKey, footer)
    },
  })
}
