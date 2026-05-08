import type { ResponsiveImage } from '@/interfaces'

const STRAPI_BASE_URL =
  import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337'

function normalizeMediaUrl(url: string): string {
  if (!url) {
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${STRAPI_BASE_URL}${url}`
}

export function mapStrapiMediaToUrl(input: unknown): string {
  if (typeof input === 'string') {
    return normalizeMediaUrl(input)
  }

  if (!input || typeof input !== 'object') {
    return ''
  }

  const media = input as Record<string, unknown>

  const directUrl = media.url
  if (typeof directUrl === 'string') {
    return normalizeMediaUrl(directUrl)
  }

  const data = media.data
  if (data && typeof data === 'object') {
    const dataRecord = data as Record<string, unknown>

    const dataUrl = dataRecord.url
    if (typeof dataUrl === 'string') {
      return normalizeMediaUrl(dataUrl)
    }

    const attributes = dataRecord.attributes
    if (attributes && typeof attributes === 'object') {
      const attrUrl = (attributes as Record<string, unknown>).url
      if (typeof attrUrl === 'string') {
        return normalizeMediaUrl(attrUrl)
      }
    }
  }

  return ''
}

export function mapResponsiveImage(input: unknown): ResponsiveImage {
  if (!input || typeof input !== 'object') {
    return { desktop: '', mobile: '' }
  }

  const image = input as Record<string, unknown>

  return {
    desktop: mapStrapiMediaToUrl(image.desktop),
    mobile: mapStrapiMediaToUrl(image.mobile),
  }
}
