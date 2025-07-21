export const QuoteTitle = ({ title }: { title: string }) => {
  return (
    <section className="m-auto max-w-[1440px] px-[155px] py-16">
      <h2 className="text-blue text-[66px] leading-[98%] font-bold">{title}</h2>
    </section>
  )
}
