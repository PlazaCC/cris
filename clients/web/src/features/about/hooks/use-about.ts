import { queryOptions, useQuery } from '@tanstack/react-query'

import { getAbout } from '@/features/about/api'

export function aboutQueryOptions() {
  return queryOptions({
    queryKey: ['about'],
    queryFn: () => getAbout(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}

export function useAbout() {
  return useQuery(aboutQueryOptions())
}
