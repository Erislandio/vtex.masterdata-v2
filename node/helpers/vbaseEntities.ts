export const VBASE_BUCKET = 'masterdatav2'
export const ENTITIES_FILE = 'entities.json'

export interface AppEntity {
  id: string
  entityName: string
  schemaName: string
  createdAt: string
}

export async function readEntities(ctx: Context): Promise<AppEntity[]> {
  try {
    const data = await ctx.clients.vbase.getJSON<AppEntity[]>(
      VBASE_BUCKET,
      ENTITIES_FILE,
      true
    )

    return Array.isArray(data) ? data : []
  } catch {
    // File does not exist yet — return empty list
    return []
  }
}

export async function writeEntities(
  ctx: Context,
  entities: AppEntity[]
): Promise<void> {
  await ctx.clients.vbase.saveJSON(VBASE_BUCKET, ENTITIES_FILE, entities)
}
