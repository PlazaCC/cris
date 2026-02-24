import { existsSync } from 'node:fs'
import { readdir, rm } from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const clientsDir = path.join(rootDir, 'clients')

const rootTargets = [
  'node_modules',
  '.pnp.cjs',
  '.pnp.loader.mjs',
]

const commonClientTargets = [
  'node_modules',
  'dist',
  'dist-ssr',
  'build',
  '.cache',
  '.vite',
  'coverage',
  '.eslintcache',
  '.tsbuildinfo',
  'tsconfig.tsbuildinfo',
]

const clientExtraTargets = {
  cms: ['.strapi', '.tmp', '.strapi-updater.json'],
}

const directoryCleanupRules = [
  {
    relativeDir: path.join('clients', 'cms', 'public', 'uploads'),
    keep: new Set(['.gitkeep']),
  },
]

async function removePath(relativePath) {
  const absolutePath = path.join(rootDir, relativePath)

  if (!existsSync(absolutePath)) {
    return false
  }

  await rm(absolutePath, { recursive: true, force: true })
  return true
}

async function getClientDirectories() {
  if (!existsSync(clientsDir)) {
    return []
  }

  const entries = await readdir(clientsDir, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

async function clearDirectoryContents(relativeDir, keep = new Set()) {
  const absoluteDir = path.join(rootDir, relativeDir)

  if (!existsSync(absoluteDir)) {
    return []
  }

  const entries = await readdir(absoluteDir, { withFileTypes: true })
  const removed = []

  for (const entry of entries) {
    if (keep.has(entry.name)) {
      continue
    }

    const relativePath = path.join(relativeDir, entry.name)
    const absolutePath = path.join(rootDir, relativePath)
    await rm(absolutePath, { recursive: true, force: true })
    removed.push(relativePath)
  }

  return removed
}

async function main() {
  const removed = []

  for (const target of rootTargets) {
    const didRemove = await removePath(target)
    if (didRemove) removed.push(target)
  }

  const clientNames = await getClientDirectories()

  for (const clientName of clientNames) {
    const targets = [
      ...commonClientTargets,
      ...(clientExtraTargets[clientName] ?? []),
    ]

    for (const target of targets) {
      const relativePath = path.join('clients', clientName, target)
      const didRemove = await removePath(relativePath)
      if (didRemove) removed.push(relativePath)
    }
  }

  for (const rule of directoryCleanupRules) {
    const deletedEntries = await clearDirectoryContents(rule.relativeDir, rule.keep)
    removed.push(...deletedEntries)
  }

  if (removed.length === 0) {
    console.log('No generated artifacts found to clean.')
    return
  }

  console.log('Cleaned paths:')
  for (const item of removed) {
    console.log(`- ${item}`)
  }
}

main().catch((error) => {
  console.error('Failed to clean project artifacts.')
  console.error(error)
  process.exit(1)
})
