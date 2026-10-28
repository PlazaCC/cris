import { queryOptions, useQuery } from '@tanstack/react-query'

import { getProjectById } from '@/features/projects/api'

// Painel: sempre busca a versão atual do banco ao abrir o editor
export function projectByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['project-by-id', id],
    queryFn: () => getProjectById({ data: { id } }),
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

export function useProjectById(id: string) {
  return useQuery(projectByIdQueryOptions(id))
}
