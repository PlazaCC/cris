import { useQuery } from '@tanstack/react-query'

import { mapStrapiProjectToDomain } from '@/lib/adapters/project-adapter'
import { apiClient } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { strapiCollectionResponseSchema } from '@/lib/api/schemas'

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const response = await apiClient.get(endpoints.projects.bySlug(slug))
      const parsed = strapiCollectionResponseSchema.parse(response.data)
      const firstProject = parsed.data[0]
      return firstProject ? mapStrapiProjectToDomain(firstProject) : null
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}
