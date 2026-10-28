import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createBadge, deleteBadge, updateBadge } from '@/features/badges/api'

// Badge renomeado ou removido muda os projetos que o usam
function useInvalidateBadges() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['badges'] }),
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['project'] }),
    ])
}

export function useCreateBadge() {
  const invalidate = useInvalidateBadges()

  return useMutation({
    mutationFn: (name: string) => createBadge({ data: { name } }),
    onSuccess: invalidate,
  })
}

export function useUpdateBadge() {
  const invalidate = useInvalidateBadges()

  return useMutation({
    mutationFn: (data: { id: string; name: string }) => updateBadge({ data }),
    onSuccess: invalidate,
  })
}

export function useDeleteBadge() {
  const invalidate = useInvalidateBadges()

  return useMutation({
    mutationFn: (id: string) => deleteBadge({ data: { id } }),
    onSuccess: invalidate,
  })
}
