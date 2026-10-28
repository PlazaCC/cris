import { Fragment } from 'react'

import { cn } from '@/lib/utils'

type ResultItem = {
  value: string
  positive: boolean
  label: string
}

// Sinal do resultado; valores que já trazem o sinal ficam como estão
function sign({ value, positive }: ResultItem) {
  return /^[+-]/.test(value.trim()) ? '' : positive ? '+' : '-'
}

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size)
  )
}

/*
 * Linhas de 2 resultados no mobile e de 3 no desktop, com um divisor entre
 * as linhas. As duas grades são renderizadas e o breakpoint escolhe uma, já
 * que o divisor depende de quantos itens cabem por linha.
 */
export function ResultsBlock({ results }: { results: ResultItem[] }) {
  if (results.length === 0) {
    return null
  }

  return (
    <section className="m-auto flex w-full max-w-[1440px] flex-col gap-12 px-5 py-16 lg:gap-16 lg:px-[155px]">
      <h2 className="text-[32px] font-bold text-black lg:text-[66px] lg:leading-[98%]">
        Results
      </h2>
      <Rows results={results} columns={2} className="lg:hidden" />
      <Rows results={results} columns={3} className="max-lg:hidden" />
    </section>
  )
}

function Rows({
  results,
  columns,
  className,
}: {
  results: ResultItem[]
  columns: 2 | 3
  className: string
}) {
  return (
    <div className={cn('flex flex-col gap-12 lg:gap-16', className)}>
      {chunk(results, columns).map((row, index) => (
        <Fragment key={index}>
          {index > 0 && <hr className="border-blue/40" />}
          <ul
            className={cn(
              'grid gap-5',
              columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
            )}
          >
            {row.map((result) => (
              <li
                className="flex flex-col gap-2 leading-[160%] lg:gap-4"
                key={`${result.value}-${result.label}`}
              >
                <p className="flex gap-6 text-[44px] leading-none whitespace-nowrap text-black lg:gap-[0.25em] lg:text-[88px]">
                  {sign(result) && <span>{sign(result)}</span>}
                  <span>{result.value}</span>
                </p>
                <p className="text-dark-black">{result.label}</p>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </div>
  )
}
