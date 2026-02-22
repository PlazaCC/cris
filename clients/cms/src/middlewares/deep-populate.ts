/**
 * Deep Populate Middleware
 *
 * Automatically populates all relations, components, and media fields
 * when `populate=deep` is used in REST API requests.
 *
 * Prevents circular references and respects configured depth limit.
 */

import type { Core } from '@strapi/strapi'

interface PopulateConfig {
  maxDepth: number
  excludeFields: string[]
}

const DEFAULT_CONFIG: PopulateConfig = {
  maxDepth: 5,
  excludeFields: ['createdBy', 'updatedBy'],
}

/**
 * Build deep populate object for a content type schema
 */
function buildDeepPopulate(
  strapi: Core.Strapi,
  modelUID: string,
  currentDepth = 0,
  config = DEFAULT_CONFIG,
  visitedModels = new Set<string>()
): Record<string, any> {
  // Prevent infinite recursion
  if (currentDepth >= config.maxDepth || visitedModels.has(modelUID)) {
    return {}
  }

  const model = (strapi as any).contentType(modelUID)
  if (!model) {
    return {}
  }

  visitedModels.add(modelUID)
  const populate: Record<string, any> = {}

  // Iterate through all attributes
  Object.entries(model.attributes).forEach(([attributeName, attribute]) => {
    // Skip excluded fields
    if (config.excludeFields.includes(attributeName)) {
      return
    }

    const attr = attribute as any

    // Handle relations
    if (attr.type === 'relation') {
      const targetModel = attr.target

      // For relations, populate recursively but prevent circular refs
      if (targetModel && !visitedModels.has(targetModel)) {
        populate[attributeName] = {
          populate: buildDeepPopulate(
            strapi,
            targetModel,
            currentDepth + 1,
            config,
            new Set(visitedModels)
          ),
        }
      } else {
        // Just populate the relation without going deeper
        populate[attributeName] = true
      }
    }
    // Handle media fields
    else if (attr.type === 'media') {
      populate[attributeName] = true
    }
    // Handle components
    else if (attr.type === 'component') {
      const componentUID = attr.component
      if (componentUID) {
        populate[attributeName] = {
          populate: buildDeepPopulate(
            strapi,
            componentUID,
            currentDepth + 1,
            config,
            new Set(visitedModels)
          ),
        }
      }
    }
    // Handle dynamic zones
    else if (attr.type === 'dynamiczone') {
      const components = attr.components || []
      populate[attributeName] = {
        on: {} as Record<string, any>,
      }

      components.forEach((componentUID: string) => {
        populate[attributeName].on[componentUID] = {
          populate: buildDeepPopulate(
            strapi,
            componentUID,
            currentDepth + 1,
            config,
            new Set(visitedModels)
          ),
        }
      })
    }
  })

  return populate
}

/**
 * Extract content type UID from request path
 */
function extractContentTypeUID(path: string): string | null {
  // Match patterns like /api/projects, /api/global, etc.
  const match = path.match(/^\/api\/([^/?]+)/)
  if (!match) return null

  const pluralName = match[1]

  // Map plural API names to UIDs
  const uidMap: Record<string, string | undefined> = {
    global: 'api::global.global',
    about: 'api::about.about',
    projects: 'api::project.project',
    badges: 'api::badge.badge',
    articles: 'api::article.article',
    authors: 'api::author.author',
    categories: 'api::category.category',
  }

  return uidMap[pluralName] || `api::${pluralName}.${pluralName}`
}

export default (config: Partial<PopulateConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  return {
    name: 'deep-populate',
    async initialize() {
      // Middleware initialization logic if needed
    },
    async handler(ctx: any, next: any) {
      const { strapi } = ctx.state as { strapi: Core.Strapi }

      // Check if populate=deep is requested
      if (ctx.query.populate === 'deep') {
        const contentTypeUID = extractContentTypeUID(ctx.request.path)

        if (contentTypeUID) {
          try {
            // Build deep populate object
            const deepPopulate = buildDeepPopulate(
              strapi,
              contentTypeUID,
              0,
              finalConfig
            )

            // Replace populate=deep with the constructed object
            ctx.query.populate = deepPopulate
          } catch (error) {
            strapi.log.error('Deep populate middleware error:', error)
            // Fallback to populate=*, 1 level deep
            ctx.query.populate = '*'
          }
        } else {
          // Fallback if we can't determine content type
          ctx.query.populate = '*'
        }
      }

      await next()
    },
  }
}
