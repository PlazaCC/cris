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

async function resolveMediaInBlocks(blocks) {
  const resolvedBlocks = []

  for (const block of blocks) {
    if (
      block.__component === 'shared.media' &&
      typeof block.file === 'string'
    ) {
      resolvedBlocks.push({
        ...block,
        file: await getOrUploadFile(block.file),
      })
      continue
    }

    if (block.__component === 'shared.slider' && Array.isArray(block.files)) {
      const files = []

      for (const fileName of block.files) {
        files.push(await getOrUploadFile(fileName))
      }

      resolvedBlocks.push({
        ...block,
        files,
      })
      continue
    }

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

async function resolveArticlePayload(article) {
  const resolved = {
    ...article,
    blocks: await resolveMediaInBlocks(article.blocks ?? []),
  }

  if (typeof resolved.cover === 'string') {
    resolved.cover = await getOrUploadFile(resolved.cover)
  }

  return resolved
}

async function resolveAboutPayload(payload) {
  return {
    ...payload,
    blocks: await resolveMediaInBlocks(payload.blocks ?? []),
  }
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

async function upsertArticle(article) {
  const existing = await strapi.documents('api::article.article').findFirst({
    filters: {
      slug: {
        $eq: article.slug,
      },
    },
  })

  const data = {
    ...article,
    publishedAt: new Date().toISOString(),
  }

  if (existing?.documentId) {
    await strapi.documents('api::article.article').update({
      documentId: existing.documentId,
      data,
    })
    return
  }

  await strapi.documents('api::article.article').create({ data })
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

  for (const article of seedData.articles ?? []) {
    const resolvedArticle = await resolveArticlePayload(article)
    await upsertArticle(resolvedArticle)
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
