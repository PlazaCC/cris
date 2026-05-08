import type { ResponsiveImage } from '@/interfaces'

type ResponsiveImageProps = {
  image: ResponsiveImage
  alt: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function ResponsiveImageView({
  image,
  alt,
  className,
  imgClassName,
  loading = 'lazy',
  fetchPriority = 'auto',
}: ResponsiveImageProps) {
  const desktopSrc = image.desktop
  const mobileSrc = image.mobile
  const fallbackSrc = mobileSrc || desktopSrc

  if (!fallbackSrc) {
    return null
  }

  return (
    <picture className={className}>
      {desktopSrc ? (
        <source media="(min-width: 768px)" srcSet={desktopSrc} />
      ) : null}
      {mobileSrc ? (
        <source media="(max-width: 767px)" srcSet={mobileSrc} />
      ) : null}
      <img
        alt={alt}
        className={imgClassName}
        decoding="async"
        fetchPriority={fetchPriority}
        loading={loading}
        src={fallbackSrc}
      />
    </picture>
  )
}
