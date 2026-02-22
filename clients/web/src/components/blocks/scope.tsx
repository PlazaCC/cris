export const ScopeBlock = ({
  title,
  paragraphs,
}: {
  title: string
  paragraphs: string[]
}) => {
  return (
    <section className="gap-10.5 flex w-full flex-col bg-white px-4 py-32">
      <h2 className="m-auto text-[66px] font-bold leading-[98%]">{title}</h2>
      <div className="text-dark-black m-auto flex w-full max-w-[670px] flex-col gap-6 leading-[160%]">
        {paragraphs.map((paragraph, index) => (
          <div
            dangerouslySetInnerHTML={{ __html: paragraph }}
            key={`${index}-${paragraph}`}
          />
        ))}
      </div>
    </section>
  )
}
