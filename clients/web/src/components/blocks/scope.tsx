export const ScopeBlock = ({
  title,
  description,
}: {
  title: string
  description: string
}) => {
  return (
    <section className="flex w-full flex-col gap-10.5 bg-white px-4 py-32">
      <h2 className="m-auto text-[66px] leading-[98%] font-bold">{title}</h2>
      <div
        className="text-dark-black m-auto w-full max-w-[670px] leading-[160%]"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </section>
  )
}
