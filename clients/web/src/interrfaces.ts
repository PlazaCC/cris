//PAGE ABOUT

export interface PageAboutResponse {
  hero: {
    title: string
    description: string
    image: string
  }
  clients: string[]
  skills: string[]
}

export type Block =
  | {
      type: 'scope'
      title: string
      description: string
    }
  | {
      type: 'quote-title'
      text: string
    }
  | {
      type: 'paragraph'
      text: string[]
    }
  | {
      type: 'image'
      images: string[]
    }
  | {
      type: 'results'
      results: {
        value: string
        positive: boolean
        label: string
      }[]
    }

export interface ProjectsResponse {
  projects: {
    title: string
    tags: string[]
    description: string
    year: string
    image: string
  }[]
  blocks: Block[]
}
