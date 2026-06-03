import { Context } from '../clients'

export const VBASE_BUCKET_PREFS = 'mdv2_prefs'

export async function readColumnPrefs(
  ctx: Context,
  entityName: string,
  schemaName: string
): Promise<string[] | null> {
  try {
    const filename = `${entityName}_${schemaName}_columns.json`
    const data = await ctx.clients.vbase.getJSON<string[]>(
      VBASE_BUCKET_PREFS,
      filename,
      true // nullIfNotFound
    )

    return Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

export async function writeColumnPrefs(
  ctx: Context,
  entityName: string,
  schemaName: string,
  fields: string[]
): Promise<void> {
  const filename = `${entityName}_${schemaName}_columns.json`

  await ctx.clients.vbase.saveJSON(VBASE_BUCKET_PREFS, filename, fields)
}
