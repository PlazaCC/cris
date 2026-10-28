import { queryOptions, useQuery } from '@tanstack/react-query'

import { getBadges } from '@/features/badges/api'

export function badgesQueryOptions() {
  return queryOptions({
    queryKey: ['badges'],
    queryFn: () => getBadges(),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  })
}

export function useBadges() {
  return useQuery(badgesQueryOptions())
}
