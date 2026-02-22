/**
 * Type definitions for Deep Populate Middleware
 */

export interface DeepPopulateConfig {
  /**
   * Maximum depth for recursive population
   * @default 5
   */
  maxDepth: number

  /**
   * Fields to exclude from population
   * Useful to avoid populating audit fields like createdBy, updatedBy
   * @default ['createdBy', 'updatedBy']
   */
  excludeFields: string[]
}

export interface PopulateObject {
  populate?: Record<string, any> | boolean
  on?: Record<string, PopulateObject>
}

export interface ContentTypeAttribute {
  type: string
  target?: string
  component?: string
  components?: string[]
}

export interface ContentTypeSchema {
  attributes: Record<string, ContentTypeAttribute>
  uid: string
  kind: 'singleType' | 'collectionType'
}
