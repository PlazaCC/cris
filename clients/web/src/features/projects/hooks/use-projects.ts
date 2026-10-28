import { queryOptions, useQuery } from '@tanstack/react-query'

import { getProjects } from '@/features/projects/api'

export function projectsQueryOptions() {
  return queryOptions({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}

export function useProjects() {
  return useQuery(projectsQueryOptions())
}
