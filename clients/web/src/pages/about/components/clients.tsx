import { Marquee } from '@/components/ui/marquee'

type AboutClientsProps = {
  clients: string[]
}

export const AboutClients = ({ clients }: AboutClientsProps) => {
  return (
    <section className="flex w-full flex-col gap-16 overflow-hidden py-16 lg:py-32">
      <h2 className="text-dark-black w-full max-w-[1440px] px-5 text-[28px] leading-[98%] font-bold lg:px-0 lg:pl-[155px]">
        Client list
      </h2>
      <Marquee className="overflow-visible!">
        {clients.map((client) => (
          <h3
            key={client}
            className="text-dark-black mr-8 w-[140px] text-center text-[32px] leading-[98%] font-bold lg:mr-16 lg:w-auto lg:max-w-[280px] lg:text-5xl"
          >
            {client}
          </h3>
        ))}
      </Marquee>
    </section>
  )
}
