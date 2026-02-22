'use strict'

const fs = require('fs-extra')
const path = require('path')
const mime = require('mime-types')
const seedData = require('../data/data.json')

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath)
  return stats.size
}

function resolveFilePath(fileName) {
  const candidates = [
    path.join(__dirname, '..', 'data', 'uploads', fileName),
    path.join(__dirname, '..', '..', 'web', 'public', 'images', fileName),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }

  return null
}

function getFileData(fileName) {
  const resolvedFilePath = resolveFilePath(fileName)

  if (!resolvedFilePath) {
    throw new Error(`Arquivo não encontrado para seed: ${fileName}`)
  }

  const size = getFileSizeInBytes(resolvedFilePath)
  const ext = path.extname(fileName).replace('.', '')
  const mimeType = mime.lookup(ext || '') || ''

  return {
    filepath: resolvedFilePath,
    originalFileName: fileName,
    size,
    mimetype: mimeType,
  }
}

async function uploadFile(file, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `Seed image ${name}`,
          caption: name,
          name,
        },
      },
    })
}

async function getOrUploadFile(fileName) {
  const fileNameWithoutExtension = path.parse(fileName).name

  const existing = await strapi.query('plugin::upload.file').findOne({
    where: {
      name: fileNameWithoutExtension,
    },
  })

  if (existing) {
    return existing
  }

  const fileData = getFileData(fileName)
  const [uploaded] = await uploadFile(fileData, fileNameWithoutExtension)

  return uploaded
}

async function resolveResponsiveImage(imageComponent) {
  if (imageComponent.__component !== 'shared.responsive-image') {
    return imageComponent
  }

  const resolved = { ...imageComponent }

  if (typeof resolved.desktop === 'string') {
    resolved.desktop = await getOrUploadFile(resolved.desktop)
  }

  if (typeof resolved.mobile === 'string') {
    resolved.mobile = await getOrUploadFile(resolved.mobile)
  }

  return resolved
}

async function resolveMediaInBlocks(blocks) {
  const resolvedBlocks = []

  for (const block of blocks) {
    // Resolve portfolio.images-block
    if (
      block.__component === 'portfolio.images-block' &&
      Array.isArray(block.images)
    ) {
      const resolvedImages = []
      for (const imageComponent of block.images) {
        resolvedImages.push(await resolveResponsiveImage(imageComponent))
      }
      resolvedBlocks.push({
        ...block,
        images: resolvedImages,
      })
      continue
    }

    // Resolve portfolio.results-block
    if (
      block.__component === 'portfolio.results-block' &&
      Array.isArray(block.results)
    ) {
      resolvedBlocks.push({
        ...block,
        results: block.results,
      })
      continue
    }

    // Other blocks pass through (scope-block, quote-title-block, paragraph-block)
    resolvedBlocks.push(block)
  }

  return resolvedBlocks
}

async function resolveGlobalPayloadMedia(payload) {
  const resolved = {
    ...payload,
    defaultSeo: {
      ...payload.defaultSeo,
    },
  }

  if (typeof resolved.favicon === 'string') {
    resolved.favicon = await getOrUploadFile(resolved.favicon)
  }

  if (typeof resolved.defaultSeo?.shareImage === 'string') {
    resolved.defaultSeo.shareImage = await getOrUploadFile(
      resolved.defaultSeo.shareImage
    )
  }

  return resolved
}

async function resolveProjectPayload(project) {
  const resolved = {
    ...project,
    blocks: await resolveMediaInBlocks(project.blocks ?? []),
  }

  if (resolved.cover_images?.__component === 'shared.responsive-image') {
    resolved.cover_images = await resolveResponsiveImage(resolved.cover_images)
  }

  // Resolve badges by name to IDs
  if (Array.isArray(resolved.badges)) {
    const badgeIds = []
    for (const badgeName of resolved.badges) {
      const badge = await strapi.documents('api::badge.badge').findFirst({
        filters: { name: { $eq: badgeName } },
      })
      if (badge?.documentId) {
        badgeIds.push(badge.documentId)
      }
    }
    resolved.badges = badgeIds
  }

  return resolved
}

async function resolveAboutPayload(payload) {
  const resolved = { ...payload }

  if (resolved.image?.__component === 'shared.responsive-image') {
    resolved.image = await resolveResponsiveImage(resolved.image)
  }

  return resolved
}

async function upsertSingleType(uid, data) {
  const existing = await strapi.documents(uid).findFirst()

  if (existing?.documentId) {
    await strapi.documents(uid).update({
      documentId: existing.documentId,
      data,
    })
    return
  }

  await strapi.documents(uid).create({ data })
}

async function upsertProject(project) {
  const existing = await strapi.documents('api::project.project').findFirst({
    filters: {
      slug: {
        $eq: project.slug,
      },
    },
  })

  const data = {
    ...project,
    publishedAt: new Date().toISOString(),
  }

  if (existing?.documentId) {
    await strapi.documents('api::project.project').update({
      documentId: existing.documentId,
      data,
    })
    return
  }

  await strapi.documents('api::project.project').create({ data })
}

async function upsertBadge(badge) {
  const existing = await strapi.documents('api::badge.badge').findFirst({
    filters: {
      name: {
        $eq: badge.name,
      },
    },
  })

  if (existing?.documentId) {
    return existing
  }

  const created = await strapi.documents('api::badge.badge').create({
    data: badge,
  })

  return created
}

async function setPublicPermissions(permissionsByController) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({
      where: { type: 'public' },
    })

  if (!publicRole?.id) {
    return
  }

  for (const [controller, actions] of Object.entries(permissionsByController)) {
    for (const action of actions) {
      const permissionAction = `api::${controller}.${controller}.${action}`

      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({
          where: {
            action: permissionAction,
            role: publicRole.id,
          },
        })

      if (existing) {
        continue
      }

      await strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: permissionAction,
          role: publicRole.id,
        },
      })
    }
  }
}

async function runSeed() {
  const resolvedGlobal = await resolveGlobalPayloadMedia(seedData.global)
  const resolvedAbout = await resolveAboutPayload(seedData.about)

  await upsertSingleType('api::global.global', resolvedGlobal)
  await upsertSingleType('api::about.about', resolvedAbout)

  // Create badges first
  for (const badge of seedData.badges ?? []) {
    await upsertBadge(badge)
  }

  // Then create projects with badge relations
  for (const project of seedData.projects ?? []) {
    const resolvedProject = await resolveProjectPayload(project)
    await upsertProject(resolvedProject)
  }

  await setPublicPermissions(seedData.permissions ?? {})
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi')

  const appContext = await compileStrapi()
  const app = await createStrapi(appContext).load()

  app.log.level = 'error'

  try {
    console.log('Running final seed...')
    await runSeed()
    console.log('Seed finished successfully.')
  } finally {
    await app.destroy()
  }

  process.exit(0)
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
