import { queryOptions, useQuery } from '@tanstack/react-query'

import { getProjectBySlug } from '@/features/projects/api'

export function projectQueryOptions(slug: string) {
  return queryOptions({
    queryKey: ['project', slug],
    queryFn: () => getProjectBySlug({ data: { slug } }),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}

export function useProject(slug: string) {
  return useQuery(projectQueryOptions(slug))
}
