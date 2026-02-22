import { useQuery } from '@tanstack/react-query'

import { mapStrapiGlobalToDomain } from '@/lib/adapters/global-adapter'
import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { strapiSingleResponseSchema } from '@/lib/api/schemas'

export function useGlobal() {
  return useQuery({
    queryKey: ['global'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.global())
      const parsed = strapiSingleResponseSchema.parse(response.data)
      return mapStrapiGlobalToDomain(parsed.data)
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    refetchOnWindowFocus: false,
  })
}
