import Marquee from 'react-fast-marquee'

type AboutClientsProps = {
  clients: string[]
}

export const AboutClients = ({ clients }: AboutClientsProps) => {
  return (
    <section className="flex w-full flex-col gap-16 overflow-hidden py-32">
      <h2 className="text-dark-black max-w-[1440px] pl-[155px] text-[28px] font-bold leading-[98%]">
        Client list
      </h2>
      <Marquee className="overflow-visible!">
        {clients.map((client) => (
          <h3
            key={client}
            className="text-dark-black mr-16 max-w-[280px] text-center text-5xl font-bold leading-[98%]"
          >
            {client}
          </h3>
        ))}
      </Marquee>
    </section>
  )
}
