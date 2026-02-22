export function LoadingState({
  message = 'Carregando...',
}: {
  message?: string
}) {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <p className="text-dark-black text-lg">{message}</p>
    </div>
  )
}
