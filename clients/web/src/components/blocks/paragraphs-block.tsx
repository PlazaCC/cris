// Mobile: parágrafos empilhados; desktop: em colunas
export const ParagraphsBlock = ({ items }: { items: string[] }) => {
  return (
    <section className="text-dark-black m-auto grid w-full max-w-[1440px] gap-[42px] px-5 py-16 leading-[160%] lg:grid-cols-3 lg:px-10">
      {items.map((item, index) => (
        <div
          dangerouslySetInnerHTML={{ __html: item }}
          key={`${index}-${item}`}
        />
      ))}
    </section>
  )
}
