import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'

import { updateGlobal } from '@/features/global/api'
import type { globalInputSchema } from '@/features/global/schemas'

import { globalQueryOptions } from './use-global'

export function useUpdateGlobal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: z.infer<typeof globalInputSchema>) =>
      updateGlobal({ data }),
    onSuccess: (global) => {
      queryClient.setQueryData(globalQueryOptions().queryKey, global)
    },
  })
}
