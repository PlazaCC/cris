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

export type MediaItem = {
  id: string
  url: string
  pathname: string
  contentType: string
  size: number
  alt: string
  createdAt: string
}

// pending: enviando | sent: e-mail entregue ao SMTP | failed: o envio deu erro
// | disabled: SMTP desligado no painel, nada foi tentado
export type ContactEmailStatus = 'pending' | 'sent' | 'failed' | 'disabled'

export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  emailStatus: ContactEmailStatus
  emailError: string | null
  emailAttempts: number
  emailedAt: string | null
  read: boolean
  createdAt: string
}

// A senha nunca sai do servidor; o painel só sabe se existe uma salva
export type MailSettings = {
  enabled: boolean
  host: string
  port: number
  secure: boolean
  username: string
  hasPassword: boolean
  fromAddress: string
  toAddress: string
}
