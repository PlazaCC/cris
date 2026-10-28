export const ScopeBlock = ({
  title,
  paragraphs,
}: {
  title: string
  paragraphs: string[]
}) => {
  return (
    <section className="flex w-full flex-col gap-[42px] bg-white px-5 py-16 lg:py-32">
      <h2 className="text-5xl leading-[98%] font-bold text-black lg:mx-auto lg:text-center lg:text-[66px]">
        {title}
      </h2>
      <div className="text-dark-black flex w-full flex-col gap-6 leading-[160%] lg:mx-auto lg:max-w-[670px]">
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
