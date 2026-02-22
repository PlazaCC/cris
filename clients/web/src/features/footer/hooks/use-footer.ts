import { useQuery } from '@tanstack/react-query'

import { mapStrapiFooterToDomain } from '@/lib/adapters/footer-adapter'
import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { strapiSingleResponseSchema } from '@/lib/api/schemas'

export function useFooter() {
  return useQuery({
    queryKey: ['footer'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.footer())
      const parsed = strapiSingleResponseSchema.parse(response.data)
      return mapStrapiFooterToDomain(parsed.data)
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}
