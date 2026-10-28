import { ResponsiveImageView } from '@/components/ui/responsive-image'
import type { ResponsiveImage } from '@/interfaces'
import { cn } from '@/lib/utils'

/*
 * As imagens entram em pares lado a lado ("Double" no Figma); se sobrar uma,
 * ela ocupa a largura toda ("Full"). As proporções são as do Figma:
 * Double 180×249 (mobile) / 670×928 (desktop), Full 380×249 / 1360×928.
 */
export function ImagesBlock({ images }: { images: ResponsiveImage[] }) {
  const visible = images.filter((image) => image.desktop || image.mobile)
  if (visible.length === 0) {
    return null
  }

  return (
    <section className="m-auto grid w-full max-w-[1440px] grid-cols-2 gap-5 p-2.5 lg:px-10 lg:py-5">
      {visible.map((image, index) => {
        const isFull = index === visible.length - 1 && index % 2 === 0

        return (
          <div
            className={cn(
              'overflow-hidden rounded-2xl',
              isFull
                ? 'col-span-2 aspect-[380/249] lg:aspect-[1360/928]'
                : 'aspect-[180/249] lg:aspect-[670/928]'
            )}
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
