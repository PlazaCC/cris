import Marquee from 'react-fast-marquee'

const clients = [
  'Jack Daniel’s',
  'Itaú',
  'NotCo',
  'Wix',
  'Asus',
  'Volkswagen',
  'Audi',
  'Porsche',
  'Ducati',
  'Yamaha Motors',
  'Hyundai',
  'Skol',
  'Vans',
  'Traton',
  'VW Truck & Buses',
  'Assurant',
  'Spotify',
]

export const AboutClients = () => {
  return (
    <section className="flex w-full flex-col gap-16 overflow-hidden py-32">
      <h2 className="text-dark-black max-w-[1440px] pl-[155px] text-[28px] leading-[98%] font-bold">
        Client list
      </h2>
      <Marquee className="overflow-visible!">
        {clients.map((client) => (
          <h3
            key={client}
            className="text-dark-black mr-16 max-w-[280px] text-center text-5xl leading-[98%] font-bold"
          >
            {client}
          </h3>
        ))}
      </Marquee>
    </section>
  )
}
