const skills = [
  'Visual Design',
  '3D',
  'Branding',
  'Facilitation',
  'Motion Graphics',
  'Photography',
  'Type Design',
  'Art Direction',

  'UI Animation',
]

export const AboutSkills = () => {
  return (
    <section className="bg-off-white py-32">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[155px]">
        <h2 className="text-blue text-[64px] leading-[98%]">skills</h2>
        <ul className="grid grid-cols-2 gap-x-[74px] gap-y-12">
          {skills.map((skill) => (
            <li className="w-[280px]" key={skill}>
              <h3 className="text-[28px] leading-[98%]">{skill}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
