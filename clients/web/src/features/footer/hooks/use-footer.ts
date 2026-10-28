import { queryOptions, useQuery } from '@tanstack/react-query'

import { getFooter } from '@/features/footer/api'

export function footerQueryOptions() {
  return queryOptions({
    queryKey: ['footer'],
    queryFn: () => getFooter(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}

export function useFooter() {
  return useQuery(footerQueryOptions())
}
