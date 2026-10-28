import { queryOptions, useQuery } from '@tanstack/react-query'

import { getMedia } from '@/features/media/api'

export function mediaQueryOptions() {
  return queryOptions({
    queryKey: ['media'],
    queryFn: () => getMedia(),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  })
}

export function useMedia() {
  return useQuery(mediaQueryOptions())
}
