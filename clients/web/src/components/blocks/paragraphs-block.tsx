export const ParagraphsBlock = ({ items }: { items: string[] }) => {
  return (
    <section className="gap-10.5 grid w-full max-w-[1440px] grid-cols-3 px-10 py-16">
      {items.map((item, index) => (
        <div
          dangerouslySetInnerHTML={{ __html: item }}
          key={`${index}-${item}`}
        />
      ))}
    </section>
  )
}
