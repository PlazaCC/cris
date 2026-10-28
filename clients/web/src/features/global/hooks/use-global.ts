import { queryOptions, useQuery } from '@tanstack/react-query'

import { getGlobal } from '@/features/global/api'

export function globalQueryOptions() {
  return queryOptions({
    queryKey: ['global'],
    queryFn: () => getGlobal(),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
  })
}

export function useGlobal() {
  return useQuery(globalQueryOptions())
}
