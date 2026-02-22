import { useQuery } from '@tanstack/react-query'

import { mapStrapiHeroToDomain } from '@/lib/adapters/hero-adapter'
import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { strapiSingleResponseSchema } from '@/lib/api/schemas'

export function useHero() {
  return useQuery({
    queryKey: ['hero'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.hero())
      const parsed = strapiSingleResponseSchema.parse(response.data)
      return mapStrapiHeroToDomain(parsed.data)
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}
