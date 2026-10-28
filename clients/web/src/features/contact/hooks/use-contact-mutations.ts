import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { z } from 'zod'

import {
  deleteContactMessage,
  resendContactMessage,
  setContactMessageRead,
  submitContactMessage,
} from '@/features/contact/api'
import type { contactInputSchema } from '@/features/contact/schemas'
import type { ContactMessage } from '@/interfaces'

import { contactMessagesQueryOptions } from './use-contact-messages'

// Formulário público
export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: z.infer<typeof contactInputSchema>) =>
      submitContactMessage({ data }),
  })
}

// Troca a mensagem atualizada na lista, sem buscar tudo de novo
function useReplaceMessage() {
  const queryClient = useQueryClient()
  const { queryKey } = contactMessagesQueryOptions()

  return (updated: ContactMessage) =>
    queryClient.setQueryData(queryKey, (messages) =>
      messages?.map((message) =>
        message.id === updated.id ? updated : message
      )
    )
}

export function useSetContactRead() {
  const replace = useReplaceMessage()

  return useMutation({
    mutationFn: (data: { id: string; read: boolean }) =>
      setContactMessageRead({ data }),
    onSuccess: replace,
  })
}

export function useResendContactMessage() {
  const replace = useReplaceMessage()

  return useMutation({
    mutationFn: (id: string) => resendContactMessage({ data: { id } }),
    onSuccess: replace,
  })
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteContactMessage({ data: { id } }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: contactMessagesQueryOptions().queryKey,
      }),
  })
}
