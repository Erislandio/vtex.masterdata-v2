import { readEntities } from '../helpers/vbaseEntities'
import { readColumnPrefs } from '../helpers/vbaseColumnPrefs'

export const Query = {
  getEntities: async (_: unknown, __: unknown, ctx: Context) => {
    return readEntities(ctx)
  },

  getColumnPrefs: async (
    _: unknown,
    args: { entityName: string; schemaName: string },
    ctx: Context
  ) => {
    return readColumnPrefs(ctx, args.entityName, args.schemaName)
  },

  getRecords: async (
    _: unknown,
    args: {
      dataEntityId: string
      page?: number
      pageSize?: number
      where?: string
      sort?: string
    },
    ctx: Context
  ) => {
    const { dataEntityId, page, pageSize, where, sort } = args
    const { masterData } = ctx.clients

    const result = await masterData.listRecords({
      dataEntityId,
      page,
      pageSize,
      where,
      sort,
    })

    return {
      data: result.data.map((record: any) => ({
        ...record,
        dataEntityId,
        fields: JSON.stringify(record.fields ?? record),
      })),
      total: result.pagination.total,
    }
  },

  getRecord: async (
    _: unknown,
    args: { dataEntityId: string; id: string },
    ctx: Context
  ) => {
    const { dataEntityId, id } = args
    const record = await ctx.clients.masterData.getRecord(dataEntityId, id)

    return {
      ...record,
      id,
      dataEntityId,
      fields: JSON.stringify(record),
    }
  },

  getSchema: async (
    _: unknown,
    args: { dataEntityId: string },
    ctx: Context
  ) => {
    const { dataEntityId } = args
    const schema = await ctx.clients.masterData.getSchema(dataEntityId)

    return {
      id: dataEntityId,
      name: schema.name ?? dataEntityId,
      properties: JSON.stringify(schema.v_indexed ?? schema),
    }
  },
}
