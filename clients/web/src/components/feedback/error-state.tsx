type ErrorStateProps = {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Erro ao carregar dados',
  message = 'Tente novamente em instantes.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-dark-black text-2xl font-bold">{title}</h2>
      <p className="text-dark-black/80">{message}</p>
      {onRetry && (
        <button
          className="bg-blue rounded-full px-4 py-2 text-white"
          onClick={onRetry}
          type="button"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
