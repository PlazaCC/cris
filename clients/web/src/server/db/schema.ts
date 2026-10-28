import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import type {
  AboutItem,
  ContactEmailStatus,
  GlobalData,
  ProjectBlock,
  ResponsiveImage,
  SocialLink,
} from '@/interfaces'

const emptyImage: ResponsiveImage = { desktop: '', mobile: '' }

// Single types têm uma única linha (id = 1)
const singletonId = () => integer('id').primaryKey().default(1)

const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow()

export const siteGlobal = pgTable(
  'site_global',
  {
    id: singletonId(),
    siteName: text('site_name').notNull().default(''),
    siteDescription: text('site_description').notNull().default(''),
    favicon: text('favicon').notNull().default(''),
    defaultSeo: jsonb('default_seo')
      .$type<GlobalData['defaultSeo']>()
      .notNull()
      .default({ metaTitle: '', metaDescription: '', shareImage: '' }),
    updatedAt: updatedAt(),
  },
  (t) => [check('site_global_singleton', sql`${t.id} = 1`)]
)

export const about = pgTable(
  'about',
  {
    id: singletonId(),
    title: text('title').notNull().default(''),
    body: text('body').notNull().default(''),
    email: text('email').notNull().default(''),
    clients: jsonb('clients').$type<AboutItem[]>().notNull().default([]),
    skills: jsonb('skills').$type<AboutItem[]>().notNull().default([]),
    image: jsonb('image')
      .$type<ResponsiveImage>()
      .notNull()
      .default(emptyImage),
    updatedAt: updatedAt(),
  },
  (t) => [check('about_singleton', sql`${t.id} = 1`)]
)

export const footer = pgTable(
  'footer',
  {
    id: singletonId(),
    brand: text('brand').notNull().default(''),
    year: text('year').notNull().default(''),
    copyright: text('copyright').notNull().default(''),
    colophon: text('colophon'),
    links: jsonb('links').$type<SocialLink[]>().notNull().default([]),
    updatedAt: updatedAt(),
  },
  (t) => [check('footer_singleton', sql`${t.id} = 1`)]
)

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  year: text('year').notNull().default(''),
  blurColor: text('blur_color').notNull().default(''),
  coverImage: jsonb('cover_image')
    .$type<ResponsiveImage>()
    .notNull()
    .default(emptyImage),
  blocks: jsonb('blocks').$type<ProjectBlock[]>().notNull().default([]),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: createdAt(),
})

export const projectBadges = pgTable(
  'project_badges',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    badgeId: uuid('badge_id')
      .notNull()
      .references(() => badges.id, { onDelete: 'cascade' }),
    position: integer('position').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.badgeId] })]
)

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull().unique(),
  pathname: text('pathname').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  alt: text('alt').notNull().default(''),
  createdAt: createdAt(),
})

// Mensagens do formulário "get in touch". Ficam salvas mesmo se o e-mail de
// aviso falhar; email_status mostra no painel o que aconteceu com o envio.
export const contactMessages = pgTable(
  'contact_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    message: text('message').notNull(),
    // Hash do IP (nunca o IP puro), só para limitar envios em sequência
    ipHash: text('ip_hash'),
    emailStatus: text('email_status')
      .$type<ContactEmailStatus>()
      .notNull()
      .default('pending'),
    emailError: text('email_error'),
    emailAttempts: integer('email_attempts').notNull().default(0),
    emailedAt: timestamp('emailed_at', { withTimezone: true }),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index('contact_messages_created_at_idx').on(t.createdAt),
    index('contact_messages_ip_hash_idx').on(t.ipHash, t.createdAt),
  ]
)

// SMTP configurado pelo painel. A senha fica cifrada (server/secret-box.ts)
export const mailSettings = pgTable(
  'mail_settings',
  {
    id: singletonId(),
    enabled: boolean('enabled').notNull().default(false),
    host: text('host').notNull().default(''),
    port: integer('port').notNull().default(587),
    secure: boolean('secure').notNull().default(false),
    username: text('username').notNull().default(''),
    passwordEncrypted: text('password_encrypted'),
    fromAddress: text('from_address').notNull().default(''),
    toAddress: text('to_address').notNull().default(''),
    updatedAt: updatedAt(),
  },
  (t) => [check('mail_settings_singleton', sql`${t.id} = 1`)]
)

export const projectsRelations = relations(projects, ({ many }) => ({
  projectBadges: many(projectBadges),
}))

export const badgesRelations = relations(badges, ({ many }) => ({
  projectBadges: many(projectBadges),
}))

export const projectBadgesRelations = relations(projectBadges, ({ one }) => ({
  project: one(projects, {
    fields: [projectBadges.projectId],
    references: [projects.id],
  }),
  badge: one(badges, {
    fields: [projectBadges.badgeId],
    references: [badges.id],
  }),
}))

// Tabelas do Better Auth (user, session, account, verification), no formato
// que o drizzleAdapter espera
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
    withTimezone: true,
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})
