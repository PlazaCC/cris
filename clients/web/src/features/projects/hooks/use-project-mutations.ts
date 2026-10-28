import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'

import {
  createProject,
  deleteProject,
  updateProject,
} from '@/features/projects/api'
import type {
  projectInputSchema,
  projectUpdateSchema,
} from '@/features/projects/schemas'

function useInvalidateProjects() {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['project'] }),
      queryClient.invalidateQueries({ queryKey: ['project-by-id'] }),
    ])
}

export function useCreateProject() {
  const invalidate = useInvalidateProjects()

  return useMutation({
    mutationFn: (data: z.infer<typeof projectInputSchema>) =>
      createProject({ data }),
    onSuccess: invalidate,
  })
}

export function useUpdateProject() {
  const invalidate = useInvalidateProjects()

  return useMutation({
    mutationFn: (data: z.infer<typeof projectUpdateSchema>) =>
      updateProject({ data }),
    onSuccess: invalidate,
  })
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjects()

  return useMutation({
    mutationFn: (id: string) => deleteProject({ data: { id } }),
    onSuccess: invalidate,
  })
}
