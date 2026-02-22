/**
 * Strapi API Endpoints
 *
 * Centralized endpoint definitions with clean populate strategy
 * Using =true for relations/components and [populate]=* for nested fields
 */

export const endpoints = {
  // Global configuration (singleton)
  global: () => '/api/global?populate[favicon]=true&populate[defaultSeo]=true',

  // Hero (singleton)
  hero: () => '/api/hero?populate[image][populate]=*',

  // Footer (singleton)
  footer: () => '/api/footer?populate[links]=true',

  // About page (singleton)
  about: () =>
    '/api/about?populate[clients]=true&populate[skills]=true&populate[image][populate]=*',

  // Projects (collection)
  projects: {
    list: () =>
      '/api/projects?sort=year:desc&populate[badges]=true&populate[cover_images][populate]=*&populate[blocks]=true',
    bySlug: (slug: string) =>
      `/api/projects?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[badges]=true&populate[cover_images][populate]=*&populate[blocks]=true`,
  },

  // Badges (collection)
  badges: {
    list: () => '/api/badges?sort=name:asc',
  },
} as const

/**
 * Helper function to build URLs with custom populate
 */
export function buildEndpoint(
  base: string,
  options?: {
    populate?: string | string[]
    filters?: Record<string, unknown>
    sort?: string
    pagination?: { page?: number; pageSize?: number }
  }
): string {
  const params = new URLSearchParams()

  // Populate
  if (options?.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach((p) => params.append('populate', p))
    } else {
      params.append('populate', options.populate)
    }
  }

  // Filters
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      params.append(`filters[${key}]`, String(value))
    })
  }

  // Sort
  if (options?.sort) {
    params.append('sort', options.sort)
  }

  // Pagination
  if (options?.pagination) {
    if (options.pagination.page) {
      params.append('pagination[page]', String(options.pagination.page))
    }
    if (options.pagination.pageSize) {
      params.append('pagination[pageSize]', String(options.pagination.pageSize))
    }
  }

  const queryString = params.toString()
  return queryString ? `${base}?${queryString}` : base
}
