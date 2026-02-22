export function getEntityFields<T extends Record<string, unknown>>(
  raw: unknown
): T {
  if (!raw || typeof raw !== 'object') {
    return {} as T
  }

  const entity = raw as Record<string, unknown>
  const attributes = entity.attributes

  if (attributes && typeof attributes === 'object') {
    return {
      ...entity,
      ...(attributes as Record<string, unknown>),
    } as T
  }

  return entity as T
}

export function toStringArray(items: unknown): string[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items
    .map((item) => (typeof item === 'string' ? item : ''))
    .filter(Boolean)
}
