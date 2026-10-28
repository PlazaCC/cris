export const QuoteTitle = ({ text }: { text: string }) => {
  return (
    <section className="m-auto w-full max-w-[1440px] px-5 py-8 lg:px-[155px] lg:py-16">
      <h2 className="text-blue text-[35px] font-bold lg:text-[66px] lg:leading-[98%]">
        {text}
      </h2>
    </section>
  )
}
