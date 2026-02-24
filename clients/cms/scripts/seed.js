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
    originalFilename: fileName,
    mimetype: mimeType,
    size,
  }
}

function toLocalUploadPath(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  const normalized = url.startsWith('/') ? url.slice(1) : url
  return path.join(__dirname, '..', 'public', normalized)
}

function collectLocalUploadPaths(fileRecord) {
  const paths = []

  if (fileRecord?.url) {
    const mainPath = toLocalUploadPath(fileRecord.url)
    if (mainPath) paths.push(mainPath)
  }

  if (fileRecord?.formats && typeof fileRecord.formats === 'object') {
    for (const format of Object.values(fileRecord.formats)) {
      if (!format || typeof format !== 'object') {
        continue
      }

      const formatUrl = format.url
      if (typeof formatUrl === 'string') {
        const formatPath = toLocalUploadPath(formatUrl)
        if (formatPath) paths.push(formatPath)
      }
    }
  }

  return paths
}

function isLocalUploadMissing(fileRecord) {
  if (!fileRecord) {
    return true
  }

  if (fileRecord.provider && fileRecord.provider !== 'local') {
    return false
  }

  const paths = collectLocalUploadPaths(fileRecord)
  if (paths.length === 0) {
    return true
  }

  return paths.some((filePath) => !fs.existsSync(filePath))
}

async function uploadFile(fileData, name) {
  return strapi
    .plugin('upload')
    .service('upload')
    .upload({
      files: fileData,
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
    if (isLocalUploadMissing(existing)) {
      console.log(
        `  [upload] Missing local file for ${fileName} (id: ${existing.id}). Reuploading...`
      )
      await strapi.query('plugin::upload.file').delete({
        where: { id: existing.id },
      })
    } else {
      console.log(
        `  [upload] Reusing existing file: ${fileName} (id: ${existing.id})`
      )
      return existing
    }
  }

  const fileData = getFileData(fileName)
  console.log(`  [upload] Uploading new file: ${fileName}`)
  const [uploaded] = await uploadFile(fileData, fileNameWithoutExtension)

  if (!uploaded) {
    throw new Error(`Upload failed for ${fileName}: returned undefined`)
  }

  console.log(`  [upload] File uploaded: ${fileName} (id: ${uploaded.id})`)
  return uploaded
}

async function resolveResponsiveImage(imageComponent) {
  if (imageComponent.__component !== 'shared.responsive-image') {
    return imageComponent
  }

  const resolved = { ...imageComponent }

  if (typeof resolved.desktop === 'string') {
    const desktopFile = await getOrUploadFile(resolved.desktop)
    resolved.desktop = desktopFile.id || desktopFile.documentId
  }

  if (typeof resolved.mobile === 'string') {
    const mobileFile = await getOrUploadFile(resolved.mobile)
    resolved.mobile = mobileFile.id || mobileFile.documentId
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

function assertResolvedResponsiveImage(component, label) {
  if (!component || component.__component !== 'shared.responsive-image') {
    throw new Error(`Seed validation failed: ${label} inválido.`)
  }

  if (!component.desktop || typeof component.desktop === 'string') {
    throw new Error(
      `Seed validation failed: ${label}.desktop não foi resolvido para ID.`
    )
  }

  if (!component.mobile || typeof component.mobile === 'string') {
    throw new Error(
      `Seed validation failed: ${label}.mobile não foi resolvido para ID.`
    )
  }
}

async function resolveGlobalPayloadMedia(payload) {
  const resolved = {
    ...payload,
    defaultSeo: {
      ...payload.defaultSeo,
    },
  }

  if (typeof resolved.favicon === 'string') {
    const faviconFile = await getOrUploadFile(resolved.favicon)
    resolved.favicon = faviconFile.id || faviconFile.documentId
  }

  if (typeof resolved.defaultSeo?.shareImage === 'string') {
    const shareImageFile = await getOrUploadFile(resolved.defaultSeo.shareImage)
    resolved.defaultSeo.shareImage =
      shareImageFile.id || shareImageFile.documentId
  }

  return resolved
}

async function resolveHeroPayloadMedia(payload) {
  const resolved = {
    ...payload,
  }

  if (resolved.image?.__component === 'shared.responsive-image') {
    resolved.image = await resolveResponsiveImage(resolved.image)
  }

  if (resolved.image) {
    assertResolvedResponsiveImage(resolved.image, 'hero.image')
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

  if (resolved.image) {
    assertResolvedResponsiveImage(resolved.image, 'about.image')
  }

  return resolved
}

async function findFirstWithAnyStatus(uid, params = {}) {
  const published = await strapi.documents(uid).findFirst({
    ...params,
    status: 'published',
  })

  if (published?.documentId) {
    return published
  }

  return strapi.documents(uid).findFirst({
    ...params,
    status: 'draft',
  })
}

async function upsertSingleType(uid, data) {
  const existing = await findFirstWithAnyStatus(uid)

  if (existing?.documentId) {
    await strapi.documents(uid).update({
      documentId: existing.documentId,
      data,
      status: 'published',
    })
    return
  }

  await strapi.documents(uid).create({ data, status: 'published' })
}

async function upsertProject(project) {
  const existing = await findFirstWithAnyStatus('api::project.project', {
    filters: {
      slug: {
        $eq: project.slug,
      },
    },
  })

  if (existing?.documentId) {
    await strapi.documents('api::project.project').update({
      documentId: existing.documentId,
      data: project,
      status: 'published',
    })
    return
  }

  await strapi.documents('api::project.project').create({
    data: project,
    status: 'published',
  })
}

async function upsertBadge(badge) {
  const existing = await findFirstWithAnyStatus('api::badge.badge', {
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
    status: 'published',
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

async function assertPublishedSingleType(uid, label) {
  const published = await strapi.documents(uid).findFirst({
    status: 'published',
  })

  if (!published?.documentId) {
    throw new Error(`Seed validation failed: ${label} não está publicado.`)
  }
}

async function assertPublishedCollectionCount(uid, expectedMinCount, label) {
  const published = await strapi.documents(uid).findMany({
    status: 'published',
    pagination: { pageSize: 1000 },
  })

  if (!Array.isArray(published) || published.length < expectedMinCount) {
    throw new Error(
      `Seed validation failed: esperado ao menos ${expectedMinCount} ${label} publicados, encontrado ${published?.length ?? 0}.`
    )
  }
}

async function validateSeedPublication() {
  await assertPublishedSingleType('api::global.global', 'global')
  await assertPublishedSingleType('api::hero.hero', 'hero')
  await assertPublishedSingleType('api::footer.footer', 'footer')
  await assertPublishedSingleType('api::about.about', 'about')
  await assertPublishedCollectionCount(
    'api::badge.badge',
    seedData.badges?.length ?? 0,
    'badges'
  )
  await assertPublishedCollectionCount(
    'api::project.project',
    seedData.projects?.length ?? 0,
    'projetos'
  )
}

async function runSeed() {
  console.log('[seed] Resolving global media...')
  const resolvedGlobal = await resolveGlobalPayloadMedia(seedData.global)
  console.log('[seed] Resolving hero media...')
  const resolvedHero = await resolveHeroPayloadMedia(seedData.hero)
  console.log('[seed] Resolving about media...')
  const resolvedAbout = await resolveAboutPayload(seedData.about)
  const resolvedFooter = seedData.footer

  console.log('[seed] Upserting global...')
  await upsertSingleType('api::global.global', resolvedGlobal)
  console.log('[seed] Upserting hero...')
  await upsertSingleType('api::hero.hero', resolvedHero)
  console.log('[seed] Upserting about...')
  await upsertSingleType('api::about.about', resolvedAbout)
  console.log('[seed] Upserting footer...')
  await upsertSingleType('api::footer.footer', resolvedFooter)

  // Create badges first
  console.log('[seed] Creating badges...')
  for (const badge of seedData.badges ?? []) {
    await upsertBadge(badge)
  }

  // Then create projects with badge relations
  console.log('[seed] Creating projects...')
  for (const project of seedData.projects ?? []) {
    console.log(`  - ${project.title}`)
    const resolvedProject = await resolveProjectPayload(project)
    await upsertProject(resolvedProject)
  }

  console.log('[seed] Setting public permissions...')
  await setPublicPermissions(seedData.permissions ?? {})
  console.log('[seed] Validating publication...')
  await validateSeedPublication()
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
