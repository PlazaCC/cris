import { createServerFn } from '@tanstack/react-start'
import { and, eq, inArray, ne } from 'drizzle-orm'
import { z } from 'zod'

import {
  projectIdSchema,
  projectInputSchema,
  projectUpdateSchema,
} from '@/features/projects/schemas'
import type { ProjectBlock } from '@/interfaces'
import { mapProjectRowToDomain } from '@/lib/adapters/project-adapter'
import { authMiddleware } from '@/server/auth-middleware'
import { db } from '@/server/db/client'
import { badges, projectBadges, projects } from '@/server/db/schema'
import { sanitizeRichText } from '@/server/sanitize'

const withBadges = {
  projectBadges: { with: { badge: true } },
} as const

export const getProjects = createServerFn({ method: 'GET' }).handler(
  async () => {
    const rows = await db.query.projects.findMany({
      with: withBadges,
      orderBy: (project, { desc }) => [
        desc(project.year),
        desc(project.createdAt),
      ],
    })
    return rows.map(mapProjectRowToDomain)
  }
)

export const getProjectBySlug = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const row = await db.query.projects.findFirst({
      where: (project, { eq }) => eq(project.slug, data.slug),
      with: withBadges,
    })
    return row ? mapProjectRowToDomain(row) : null
  })

// Usado pelo painel: o slug pode mudar durante a edição, o id não
export const getProjectById = createServerFn({ method: 'GET' })
  .validator(projectIdSchema)
  .handler(async ({ data }) => {
    const row = await db.query.projects.findFirst({
      where: (project, { eq }) => eq(project.id, data.id),
      with: withBadges,
    })
    return row ? mapProjectRowToDomain(row) : null
  })

type ProjectInput = z.infer<typeof projectInputSchema>

// O HTML dos parágrafos é sanitizado na escrita (é injetado na página pública)
function sanitizeBlocks(blocks: ProjectBlock[]): ProjectBlock[] {
  return blocks.map((block) => {
    switch (block.type) {
      case 'scope':
        return { ...block, paragraphs: block.paragraphs.map(sanitizeRichText) }
      case 'paragraph':
        return { ...block, items: block.items.map(sanitizeRichText) }
      default:
        return block
    }
  })
}

function toRow(input: ProjectInput) {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    year: input.year,
    blurColor: input.blurColor,
    coverImage: input.coverImages,
    blocks: sanitizeBlocks(input.blocks),
  }
}

async function assertSlugAvailable(slug: string, ignoreId?: string) {
  const taken = await db.query.projects.findFirst({
    where: ignoreId
      ? and(eq(projects.slug, slug), ne(projects.id, ignoreId))
      : eq(projects.slug, slug),
  })

  if (taken) {
    throw new Error(`Já existe um projeto com o slug "${slug}"`)
  }
}

// Badges chegam por nome; a posição segue a ordem escolhida no painel
async function badgeLinks(projectId: string, names: string[]) {
  if (names.length === 0) return []

  const rows = await db
    .select({ id: badges.id, name: badges.name })
    .from(badges)
    .where(inArray(badges.name, names))
  const idByName = new Map(rows.map((row) => [row.name, row.id]))

  return names.flatMap((name, position) => {
    const badgeId = idByName.get(name)
    return badgeId ? [{ projectId, badgeId, position }] : []
  })
}

export const createProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(projectInputSchema)
  .handler(async ({ data }) => {
    await assertSlugAvailable(data.slug)

    const id = crypto.randomUUID()
    const links = await badgeLinks(id, data.badges)

    // neon-http não tem transação interativa; o batch roda tudo numa transação
    await db.batch([
      db.insert(projects).values({ id, ...toRow(data) }),
      ...(links.length ? [db.insert(projectBadges).values(links)] : []),
    ])

    return { id, slug: data.slug }
  })

export const updateProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(projectUpdateSchema)
  .handler(async ({ data }) => {
    await assertSlugAvailable(data.slug, data.id)

    const links = await badgeLinks(data.id, data.badges)

    await db.batch([
      db.update(projects).set(toRow(data)).where(eq(projects.id, data.id)),
      db.delete(projectBadges).where(eq(projectBadges.projectId, data.id)),
      ...(links.length ? [db.insert(projectBadges).values(links)] : []),
    ])

    return { id: data.id, slug: data.slug }
  })

export const deleteProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(projectIdSchema)
  .handler(async ({ data }) => {
    await db.delete(projects).where(eq(projects.id, data.id))
  })
