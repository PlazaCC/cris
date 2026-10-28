import { ErrorState } from '@/components/feedback/error-state'
import { LoadingState } from '@/components/feedback/loading-state'

type QueryStateProps<T> = {
  query: {
    data: T | undefined
    isLoading: boolean
    error: unknown
    refetch: () => unknown
  }
  children: (data: T) => React.ReactNode
}

// Carregando/erro ocupando o lugar do formulário, como nas seções do site
export function QueryState<T>({ query, children }: QueryStateProps<T>) {
  if (query.data !== undefined) {
    return children(query.data)
  }

  return (
    <div className="bg-card flex min-h-80 items-center justify-center rounded-xl border">
      {query.error ? (
        <ErrorState
          title="Não foi possível carregar"
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : (
        <LoadingState message="Carregando..." />
      )}
    </div>
  )
}
