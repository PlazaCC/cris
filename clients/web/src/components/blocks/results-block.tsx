type ResultItem = {
  value: string
  positive: boolean
  label: string
}

export function ResultsBlock({ results }: { results: ResultItem[] }) {
  if (results.length === 0) {
    return null
  }

  return (
    <section className="m-auto w-full max-w-[1440px] px-10 py-16">
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {results.map((result) => (
          <li
            className="bg-off-white rounded-[24px] p-8"
            key={`${result.value}-${result.label}`}
          >
            <p className="text-blue text-4xl font-bold">{result.value}</p>
            <p className="text-dark-black mt-2 text-lg">{result.label}</p>
            <p className="mt-3 text-sm">
              {result.positive
                ? 'Indicador positivo'
                : 'Indicador neutro/negativo'}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
