import { readEntities, writeEntities } from '../helpers/vbaseEntities'
import { writeColumnPrefs } from '../helpers/vbaseColumnPrefs'

export const Mutation = {
  saveEntity: async (
    _: unknown,
    args: { entityName: string; schemaName: string },
    ctx: Context
  ) => {
    const { entityName, schemaName } = args
    const entities = await readEntities(ctx)

    const newEntity = {
      id: `${Date.now()}`,
      entityName,
      schemaName,
      createdAt: new Date().toISOString(),
    }

    await writeEntities(ctx, [...entities, newEntity])

    return newEntity
  },

  deleteEntity: async (
    _: unknown,
    args: { id: string },
    ctx: Context
  ) => {
    const { id } = args
    const entities = await readEntities(ctx)
    const filtered = entities.filter(e => e.id !== id)

    await writeEntities(ctx, filtered)

    return true
  },

  saveColumnPrefs: async (
    _: unknown,
    args: { entityName: string; schemaName: string; fields: string[] },
    ctx: Context
  ) => {
    const { entityName, schemaName, fields } = args

    await writeColumnPrefs(ctx, entityName, schemaName, fields)

    return true
  },

  createRecord: async (
    _: unknown,
    args: { dataEntityId: string; fields: string },
    ctx: Context
  ) => {
    const { dataEntityId, fields } = args
    const parsedFields = JSON.parse(fields)
    const record = await ctx.clients.masterData.createRecord(
      dataEntityId,
      parsedFields
    )

    return {
      ...record,
      dataEntityId,
      fields,
    }
  },

  updateRecord: async (
    _: unknown,
    args: { dataEntityId: string; id: string; fields: string },
    ctx: Context
  ) => {
    const { dataEntityId, id, fields } = args
    const parsedFields = JSON.parse(fields)
    const record = await ctx.clients.masterData.updateRecord(
      dataEntityId,
      id,
      parsedFields
    )

    return {
      ...record,
      id,
      dataEntityId,
      fields,
    }
  },

  deleteRecord: async (
    _: unknown,
    args: { dataEntityId: string; id: string },
    ctx: Context
  ) => {
    const { dataEntityId, id } = args

    return ctx.clients.masterData.deleteRecord(dataEntityId, id)
  },
}
