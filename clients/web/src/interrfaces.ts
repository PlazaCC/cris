export type ResponsiveImage = {
  desktop: string
  mobile: string
}

export type Badge = {
  documentId: string
  name: string
  slug?: string
}

export type AboutItem = {
  name: string
}

export type AboutData = {
  title: string
  body: string
  clients: AboutItem[]
  skills: AboutItem[]
  image: ResponsiveImage
  email: string
}

export type SocialLink = {
  title: string
  url: string
}

export type HeroData = {
  highlight: string
  title: string
  subtitle: string
  name: string
  description: string
  image: ResponsiveImage
}

export type FooterData = {
  brand: string
  links: SocialLink[]
  year: string
  copyright: string
  colophon?: string
}

export type ProjectBlock =
  | {
      type: 'scope'
      title: string
      paragraphs: string[]
    }
  | {
      type: 'quote-title'
      text: string
    }
  | {
      type: 'paragraph'
      items: string[]
    }
  | {
      type: 'images'
      images: ResponsiveImage[]
    }
  | {
      type: 'results'
      results: {
        value: string
        positive: boolean
        label: string
      }[]
    }

export type Project = {
  documentId: string
  slug: string
  title: string
  description: string
  year: string
  blurColor: string
  badges: string[]
  coverImages: ResponsiveImage
  blocks: ProjectBlock[]
}

export type GlobalData = {
  siteName: string
  siteDescription: string
  favicon: string
  defaultSeo: {
    metaTitle: string
    metaDescription: string
    shareImage: string
  }
}
