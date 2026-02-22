import { useQuery } from '@tanstack/react-query'

import { mapStrapiAboutToDomain } from '@/lib/adapters/about-adapter'
import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { strapiSingleResponseSchema } from '@/lib/api/schemas'

export function useAbout() {
  return useQuery({
    queryKey: ['about'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.about())
      const parsed = strapiSingleResponseSchema.parse(response.data)
      return mapStrapiAboutToDomain(parsed.data)
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}
