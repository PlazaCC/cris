import type { Schema, Struct } from '@strapi/strapi'

export interface PortfolioClientItem extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_client_items'
  info: {
    description: 'Individual client name'
    displayName: 'Client Item'
  }
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface PortfolioImagesBlock extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_images_blocks'
  info: {
    description: 'Block with responsive image gallery'
    displayName: 'Images Block'
  }
  attributes: {
    images: Schema.Attribute.Component<'shared.responsive-image', true> &
      Schema.Attribute.Required
  }
}

export interface PortfolioParagraphBlock extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_paragraph_blocks'
  info: {
    description: 'Block with array of text paragraphs'
    displayName: 'Paragraph Block'
  }
  attributes: {
    items: Schema.Attribute.Component<'portfolio.paragraph-item', true> &
      Schema.Attribute.Required
  }
}

export interface PortfolioParagraphItem extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_paragraph_items'
  info: {
    description: 'Individual paragraph with HTML support'
    displayName: 'Paragraph Item'
  }
  attributes: {
    content: Schema.Attribute.Text & Schema.Attribute.Required
  }
}

export interface PortfolioQuoteTitleBlock extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_quote_title_blocks'
  info: {
    description: 'Large heading quote block'
    displayName: 'Quote Title Block'
  }
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface PortfolioResultItem extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_result_items'
  info: {
    description: 'Individual result metric with value and label'
    displayName: 'Result Item'
  }
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required
    positive: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>
    value: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface PortfolioResultsBlock extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_results_blocks'
  info: {
    description: 'Block with project results and metrics'
    displayName: 'Results Block'
  }
  attributes: {
    results: Schema.Attribute.Component<'portfolio.result-item', true> &
      Schema.Attribute.Required
  }
}

export interface PortfolioScopeBlock extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_scope_blocks'
  info: {
    description: 'Block with title and HTML paragraphs'
    displayName: 'Scope Block'
  }
  attributes: {
    paragraphs: Schema.Attribute.Component<'portfolio.paragraph-item', true> &
      Schema.Attribute.Required
    title: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface PortfolioSkillItem extends Struct.ComponentSchema {
  collectionName: 'components_portfolio_skill_items'
  info: {
    description: 'Individual skill'
    displayName: 'Skill Item'
  }
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required
  }
}

export interface SharedResponsiveImage extends Struct.ComponentSchema {
  collectionName: 'components_shared_responsive_images'
  info: {
    description: 'Image for desktop and mobile'
    displayName: 'Responsive Image'
  }
  attributes: {
    desktop: Schema.Attribute.Media<'images'> & Schema.Attribute.Required
    mobile: Schema.Attribute.Media<'images'> & Schema.Attribute.Required
  }
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos'
  info: {
    description: 'Search and sharing metadata'
    displayName: 'SEO'
    icon: 'allergies'
    name: 'Seo'
  }
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required
    shareImage: Schema.Attribute.Media<'images'>
  }
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links'
  info: {
    description: 'Social media link with title and URL'
    displayName: 'Social Link'
  }
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required
    url: Schema.Attribute.String & Schema.Attribute.Required
  }
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'portfolio.client-item': PortfolioClientItem
      'portfolio.images-block': PortfolioImagesBlock
      'portfolio.paragraph-block': PortfolioParagraphBlock
      'portfolio.paragraph-item': PortfolioParagraphItem
      'portfolio.quote-title-block': PortfolioQuoteTitleBlock
      'portfolio.result-item': PortfolioResultItem
      'portfolio.results-block': PortfolioResultsBlock
      'portfolio.scope-block': PortfolioScopeBlock
      'portfolio.skill-item': PortfolioSkillItem
      'shared.responsive-image': SharedResponsiveImage
      'shared.seo': SharedSeo
      'shared.social-link': SharedSocialLink
    }
  }
}
