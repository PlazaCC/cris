import { ResponsiveImageView } from '@/components/ui/responsive-image'
import type { ResponsiveImage } from '@/interrfaces'

export function ImagesBlock({ images }: { images: ResponsiveImage[] }) {
  if (images.length === 0) {
    return null
  }

  return (
    <section className="m-auto flex w-full max-w-[1440px] flex-col gap-8 px-10 py-16">
      {images.map((image, index) => {
        if (!image.desktop && !image.mobile) {
          return null
        }

        return (
          <div
            className="overflow-hidden rounded-[24px]"
            key={`${index}-${image.desktop}-${image.mobile}`}
          >
            <ResponsiveImageView
              alt={`Project image ${index + 1}`}
              image={image}
              imgClassName="h-full w-full object-cover"
            />
          </div>
        )
      })}
    </section>
  )
}
