/**
 * Seed do conteúdo: seed/data.json + seed/uploads → Vercel Blob + Neon.
 *
 * Idempotente: pode rodar várias vezes (upsert por id/slug/url).
 * Uso: yarn workspace client-web db:seed
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { put } from '@vercel/blob'
import { eq } from 'drizzle-orm'

import type { ProjectBlock, ResponsiveImage } from '../src/interfaces'
import { db } from '../src/server/db/client'
import { projectBlocksSchema } from '../src/server/db/json-types'
import {
  about,
  badges,
  footer,
  media,
  projectBadges,
  projects,
  siteGlobal,
} from '../src/server/db/schema'

const seedDir = path.resolve(import.meta.dirname, '..', 'seed')

type SeedImage = { desktop: string; mobile: string }
type SeedItem<T> = T & { __component?: string }
type SeedBlock = Record<string, unknown> & { __component: string }

type SeedData = {
  badges: { name: string }[]
  global: {
    siteName: string
    siteDescription: string
    favicon: string
    defaultSeo: { metaTitle: string; metaDescription: string; shareImage: string }
  }
  footer: {
    brand: string
    links: SeedItem<{ title: string; url: string }>[]
    year: string
    copyright: string
    colophon?: string
  }
  about: {
    title: string
    body: string
    clients: SeedItem<{ name: string }>[]
    skills: SeedItem<{ name: string }>[]
    image: SeedImage
    email: string
  }
  projects: {
    slug: string
    title: string
    description: string
    year: string
    blur_color: string
    badges: string[]
    cover_images: SeedImage
    blocks: SeedBlock[]
  }[]
}

const contentTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

// Cache por arquivo: cada imagem sobe uma vez por execução
const uploaded = new Map<string, string>()

async function uploadFile(fileName: string): Promise<string> {
  if (!fileName) {
    return ''
  }

  const cached = uploaded.get(fileName)
  if (cached) {
    return cached
  }

  const body = await readFile(path.join(seedDir, 'uploads', fileName))
  const contentType =
    contentTypes[path.extname(fileName).toLowerCase()] ??
    'application/octet-stream'

  const blob = await put(`seed/${fileName}`, body, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  await db
    .insert(media)
    .values({
      url: blob.url,
      pathname: blob.pathname,
      contentType,
      size: body.byteLength,
      alt: '',
    })
    .onConflictDoUpdate({
      target: media.url,
      set: { pathname: blob.pathname, contentType, size: body.byteLength },
    })

  uploaded.set(fileName, blob.url)
  console.log(`  ↑ ${fileName}`)
  return blob.url
}

async function uploadImage(image: SeedImage): Promise<ResponsiveImage> {
  return {
    desktop: await uploadFile(image.desktop),
    mobile: await uploadFile(image.mobile),
  }
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function contents(items: unknown): string[] {
  return Array.isArray(items)
    ? items.map((item: { content?: string }) => item.content ?? '')
    : []
}

// Strapi dynamic zone (`__component`) → ProjectBlock (`type`)
async function convertBlock(block: SeedBlock): Promise<ProjectBlock> {
  switch (block.__component) {
    case 'portfolio.scope-block':
      return {
        type: 'scope',
        title: String(block.title ?? ''),
        paragraphs: contents(block.paragraphs),
      }
    case 'portfolio.quote-title-block':
      return { type: 'quote-title', text: String(block.text ?? '') }
    case 'portfolio.paragraph-block':
      return { type: 'paragraph', items: contents(block.items) }
    case 'portfolio.images-block':
      return {
        type: 'images',
        images: await Promise.all(
          (block.images as SeedImage[]).map((image) => uploadImage(image))
        ),
      }
    case 'portfolio.results-block':
      return {
        type: 'results',
        results: (
          block.results as { value: string; positive: boolean; label: string }[]
        ).map(({ value, positive, label }) => ({ value, positive, label })),
      }
    default:
      throw new Error(`Bloco desconhecido no seed: ${block.__component}`)
  }
}

async function main() {
  const data = JSON.parse(
    await readFile(path.join(seedDir, 'data.json'), 'utf-8')
  ) as SeedData

  console.log('Global')
  const globalValues = {
    id: 1,
    siteName: data.global.siteName,
    siteDescription: data.global.siteDescription,
    favicon: await uploadFile(data.global.favicon),
    defaultSeo: {
      metaTitle: data.global.defaultSeo.metaTitle,
      metaDescription: data.global.defaultSeo.metaDescription,
      shareImage: await uploadFile(data.global.defaultSeo.shareImage),
    },
  }
  await db
    .insert(siteGlobal)
    .values(globalValues)
    .onConflictDoUpdate({ target: siteGlobal.id, set: globalValues })

  console.log('About')
  const aboutValues = {
    id: 1,
    title: data.about.title,
    body: data.about.body,
    email: data.about.email,
    clients: data.about.clients.map(({ name }) => ({ name })),
    skills: data.about.skills.map(({ name }) => ({ name })),
    image: await uploadImage(data.about.image),
  }
  await db
    .insert(about)
    .values(aboutValues)
    .onConflictDoUpdate({ target: about.id, set: aboutValues })

  console.log('Footer')
  const footerValues = {
    id: 1,
    brand: data.footer.brand,
    year: data.footer.year,
    copyright: data.footer.copyright,
    colophon: data.footer.colophon ?? null,
    links: data.footer.links.map(({ title, url }) => ({ title, url })),
  }
  await db
    .insert(footer)
    .values(footerValues)
    .onConflictDoUpdate({ target: footer.id, set: footerValues })

  console.log('Badges')
  const badgeIds = new Map<string, string>()
  for (const { name } of data.badges) {
    const [row] = await db
      .insert(badges)
      .values({ name, slug: slugify(name) })
      .onConflictDoUpdate({ target: badges.slug, set: { name } })
      .returning({ id: badges.id })
    badgeIds.set(name, row.id)
  }

  console.log('Projects')
  for (const project of data.projects) {
    const values = {
      slug: project.slug,
      title: project.title,
      description: project.description,
      year: project.year,
      blurColor: project.blur_color,
      coverImage: await uploadImage(project.cover_images),
      blocks: projectBlocksSchema.parse(
        await Promise.all(project.blocks.map(convertBlock))
      ),
    }

    const [row] = await db
      .insert(projects)
      .values(values)
      .onConflictDoUpdate({ target: projects.slug, set: values })
      .returning({ id: projects.id })

    // neon-http não tem transação interativa: recria os vínculos em sequência
    await db.delete(projectBadges).where(eq(projectBadges.projectId, row.id))

    const links = project.badges.map((name, position) => {
      const badgeId = badgeIds.get(name)
      if (!badgeId) {
        throw new Error(`Badge "${name}" do projeto ${project.slug} não existe`)
      }
      return { projectId: row.id, badgeId, position }
    })

    if (links.length > 0) {
      await db.insert(projectBadges).values(links)
    }

    console.log(`  ✓ ${project.slug}`)
  }

  console.log('Seed concluído.')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
