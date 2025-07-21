export const ParagraphsBlock = ({
  blocks,
}: {
  blocks: ({ text: string } | null)[]
}) => {
  return (
    <section className="grid w-full max-w-[1440px] grid-cols-3 gap-10.5 px-10 py-16">
      {blocks.map((block, index) => {
        if (block === null) {
          return <span />
        }
        return <p key={index}>{block?.text}</p>
      })}
    </section>
  )
}
