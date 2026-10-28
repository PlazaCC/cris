import { queryOptions, useQuery } from '@tanstack/react-query'

import { getAdminUser } from '@/features/auth/api'

export function adminUserQueryOptions() {
  return queryOptions({
    queryKey: ['admin-user'],
    queryFn: () => getAdminUser(),
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  })
}

export function useAdminUser() {
  return useQuery(adminUserQueryOptions())
}
