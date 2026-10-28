import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authClient } from '@/lib/auth-client'

import { adminUserQueryOptions } from './use-admin-user'

export function useSignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { error } = await authClient.signIn.email(credentials)

      if (error) {
        throw new Error(
          error.status === 401
            ? 'Email ou senha incorretos'
            : (error.message ?? 'Não foi possível entrar')
        )
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: adminUserQueryOptions().queryKey,
      }),
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () =>
      queryClient.removeQueries({ queryKey: adminUserQueryOptions().queryKey }),
  })
}
