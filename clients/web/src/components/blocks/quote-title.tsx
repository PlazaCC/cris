export const QuoteTitle = ({ text }: { text: string }) => {
  return (
    <section className="m-auto max-w-[1440px] px-[155px] py-16">
      <h2 className="text-blue text-[66px] font-bold leading-[98%]">{text}</h2>
    </section>
  )
}
