import { queryOptions, useQuery } from '@tanstack/react-query'

import { getContactMessages } from '@/features/contact/api'

export function contactMessagesQueryOptions() {
  return queryOptions({
    queryKey: ['contact-messages'],
    queryFn: () => getContactMessages(),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  })
}

export function useContactMessages() {
  return useQuery(contactMessagesQueryOptions())
}
