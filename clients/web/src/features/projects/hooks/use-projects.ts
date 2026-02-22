import { useQuery } from '@tanstack/react-query'

import { mapStrapiProjectToDomain } from '@/lib/adapters/project-adapter'
import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { strapiCollectionResponseSchema } from '@/lib/api/schemas'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.projects.list())
      const parsed = strapiCollectionResponseSchema.parse(response.data)
      return parsed.data.map((project) => mapStrapiProjectToDomain(project))
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}
