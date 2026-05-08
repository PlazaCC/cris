import { projectSchema } from '@/features/projects/schemas'
import type { Project, ProjectBlock } from '@/interfaces'
import { mapStrapiBadgesToNames } from './badge-adapter'
import { getEntityFields } from './strapi-helpers'
import { mapResponsiveImage } from './strapi-image'

function mapParagraphItems(rawItems: unknown): string[] {
  if (!Array.isArray(rawItems)) {
    return []
  }

  return rawItems
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return ''
      }

      const value = (item as Record<string, unknown>).content
      return typeof value === 'string' ? value : ''
    })
    .filter(Boolean)
}

function mapProjectBlock(rawBlock: unknown): ProjectBlock | null {
  if (!rawBlock || typeof rawBlock !== 'object') {
    return null
  }

  const block = rawBlock as Record<string, unknown>
  const component = block.__component

  if (component === 'portfolio.scope-block') {
    return {
      type: 'scope',
      title: typeof block.title === 'string' ? block.title : '',
      paragraphs: mapParagraphItems(block.paragraphs),
    }
  }

  if (component === 'portfolio.quote-title-block') {
    return {
      type: 'quote-title',
      text: typeof block.text === 'string' ? block.text : '',
    }
  }

  if (component === 'portfolio.paragraph-block') {
    return {
      type: 'paragraph',
      items: mapParagraphItems(block.items),
    }
  }

  if (component === 'portfolio.images-block') {
    const images = Array.isArray(block.images)
      ? block.images.map((image) => mapResponsiveImage(image))
      : []

    return {
      type: 'images',
      images,
    }
  }

  if (component === 'portfolio.results-block') {
    const results = Array.isArray(block.results)
      ? block.results.map((item) => {
          if (!item || typeof item !== 'object') {
            return {
              value: '',
              positive: false,
              label: '',
            }
          }

          const entry = item as Record<string, unknown>

          return {
            value: typeof entry.value === 'string' ? entry.value : '',
            positive:
              typeof entry.positive === 'boolean' ? entry.positive : false,
            label: typeof entry.label === 'string' ? entry.label : '',
          }
        })
      : []

    return {
      type: 'results',
      results,
    }
  }

  return null
}

export function mapStrapiProjectToDomain(rawProject: unknown): Project {
  const fields = getEntityFields<Record<string, unknown>>(rawProject)
  const parsed = projectSchema.parse(fields)

  const blocks = (parsed.blocks ?? [])
    .map((block) => mapProjectBlock(block))
    .filter((block): block is ProjectBlock => Boolean(block))

  return {
    documentId: parsed.documentId ?? '',
    slug: parsed.slug ?? '',
    title: parsed.title ?? '',
    description: parsed.description ?? '',
    year: parsed.year ?? '',
    blurColor: parsed.blur_color ?? '',
    badges: mapStrapiBadgesToNames(parsed.badges),
    coverImages: mapResponsiveImage(parsed.cover_images),
    blocks,
  }
}
