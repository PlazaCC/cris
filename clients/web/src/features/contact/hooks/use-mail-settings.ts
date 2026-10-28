import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { z } from 'zod'

import {
  getMailSettings,
  sendTestMail,
  updateMailSettings,
} from '@/features/contact/api'
import type { mailSettingsInputSchema } from '@/features/contact/schemas'

export function mailSettingsQueryOptions() {
  return queryOptions({
    queryKey: ['mail-settings'],
    queryFn: () => getMailSettings(),
    staleTime: 0,
    refetchOnWindowFocus: false,
  })
}

export function useMailSettings() {
  return useQuery(mailSettingsQueryOptions())
}

export function useUpdateMailSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: z.infer<typeof mailSettingsInputSchema>) =>
      updateMailSettings({ data }),
    onSuccess: (settings) => {
      queryClient.setQueryData(mailSettingsQueryOptions().queryKey, settings)
    },
  })
}

export function useSendTestMail() {
  return useMutation({ mutationFn: () => sendTestMail() })
}
