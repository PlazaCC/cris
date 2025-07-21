export const AboutHero = () => {
  return (
    <section className="mx-auto flex max-w-[1440px] gap-[138px] py-8 pr-10 pl-[155px]">
      <div className="flex flex-1 flex-col gap-[155px] text-[32px] leading-[100%] font-bold">
        <span className="text-black">unk</span>
        <div className="flex flex-col gap-16">
          <h1 className="text-dark-black text-[66px] leading-[98%] font-bold">
            A Swiss Knive designer made in Brazil.
          </h1>
          <p className="text-dark-black text-lg">
            start each project, large or small by understanding and framing the
            problem we're facing. Once the problem is well defined, I
            collaborate with the team to set clear, measurable goals that align
            with both project requirements and the broader company vision.
            <br />
            <br />
            Next, I conduct different types of research, based on the nature of
            the problem and the goals that we're trying to achieve. Finally, I
            craft a focused design strategy and develop a roadmap to guide the
            team toward successful execution.
          </p>
        </div>
      </div>
      <div className="bg-blue h-[811px] flex-1 rounded-[32px]"></div>
    </section>
  )
}
