import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

import { ErrorComponentProps } from '@tanstack/react-router'
import { Panda } from 'lucide-react'

interface ErrorPageProps extends ErrorComponentProps {
  children?: React.ReactNode
  title?: string
  showErrorMessage?: boolean
  showReloadButton?: boolean
}

export const ErrorPage = ({
  error,
  title = 'Não foi possível carregar a página',
  showErrorMessage = import.meta.env.DEV,
  children,
  showReloadButton = true,
  info,
  reset,
}: ErrorPageProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
      <Panda size={12} className="text-muted-foreground size-12" />
      {title && (
        <span className="text-foreground text-center text-lg font-semibold">
          {title}
        </span>
      )}
      {showErrorMessage && (
        <p className="text-destructive max-w-[600px] text-center text-sm">
          {error.message}
        </p>
      )}
      <div className="flex gap-2">
        {showReloadButton && (
          <Button onClick={() => reset()} variant={'outline'}>
            Recarregar página
          </Button>
        )}
        {info && (
          <Dialog>
            <DialogTrigger>
              <Button>abrir stack</Button>
            </DialogTrigger>
            {
              <DialogContent>
                <pre>{info?.componentStack}</pre>
              </DialogContent>
            }
          </Dialog>
        )}
      </div>

      {children}
    </div>
  )
}
