import { useQuery } from '@tanstack/react-query'

import { mapStrapiBadgeToDomain } from '@/lib/adapters/badge-adapter'
import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { strapiCollectionResponseSchema } from '@/lib/api/schemas'

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.badges.list())
      const parsed = strapiCollectionResponseSchema.parse(response.data)
      return parsed.data.map((badge) => mapStrapiBadgeToDomain(badge))
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  })
}
