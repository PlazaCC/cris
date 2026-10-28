type AboutSkillsProps = {
  skills: string[]
}

export const AboutSkills = ({ skills }: AboutSkillsProps) => {
  return (
    <section className="bg-off-white py-32">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-16 px-5 lg:flex-row lg:items-center lg:justify-between lg:px-[155px]">
        <h2 className="text-blue text-[64px] leading-[98%] first-letter:uppercase lg:first-letter:lowercase">
          skills
        </h2>
        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 lg:gap-x-[74px]">
          {skills.map((skill) => (
            <li className="lg:w-[280px]" key={skill}>
              <h3 className="text-[28px] leading-[98%]">{skill}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
