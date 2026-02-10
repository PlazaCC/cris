export interface PageAboutResponse {
  hero: {
    title: string
    description: string
    image: {
      desktop: string
      mobile: string
    }
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
      images: {
        desktop: string
        mobile: string
      }[]
    }
  | {
      type: 'results'
      results: {
        value: string
        positive: boolean
        label: string
      }[]
    }

export interface Project {
  title: string
  tags: string[]
  description: string
  year: string
  image: {
    desktop: string
    mobile: string
  }
}

export interface ProjectsResponse {
  projects: Project[]
  blocks: Block[]
}
