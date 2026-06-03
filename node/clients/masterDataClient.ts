import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

interface MasterDataRecord {
  id?: string
  dataEntityId: string
  fields: Record<string, any>
  createdIn?: string
  updatedIn?: string
  lastInteractionIn?: string
}

interface ListRecordsArgs {
  dataEntityId: string
  page?: number
  pageSize?: number
  where?: string
  sort?: string
}

interface MasterDataPaginatedResponse {
  data: MasterDataRecord[]
  pagination: {
    total: number
    page: number
    pageSize: number
  }
}

export class MasterDataClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://api.vtex.com/${context.account}/dataentities`,
      context,
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.vtex.ds.v10+json',
          VtexIdclientAutCookie: context.authToken,
        },
      }
    )
  }

  public async listRecords({
    dataEntityId,
    page = 1,
    pageSize = 20,
    where,
    sort,
  }: ListRecordsArgs): Promise<MasterDataPaginatedResponse> {
    const params: Record<string, string | number> = {
      _page: page,
      _size: pageSize,
    }

    if (where) params._where = where
    if (sort) params._sort = sort

    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&')

    const response = await this.http.getRaw<MasterDataRecord[]>(
      `/${dataEntityId}/search?${queryString}`
    )

    const total = Number(
      response.headers?.['rest-content-range']?.split('/')[1] ?? 0
    )

    return {
      data: response.data,
      pagination: { total, page, pageSize },
    }
  }

  public async getRecord(
    dataEntityId: string,
    id: string
  ): Promise<MasterDataRecord> {
    return this.http.get(`/${dataEntityId}/documents/${id}`)
  }

  public async createRecord(
    dataEntityId: string,
    fields: Record<string, any>
  ): Promise<MasterDataRecord> {
    const response = await this.http.post<{ DocumentId: string }>(
      `/${dataEntityId}/documents`,
      fields
    )

    return { id: response.DocumentId, dataEntityId, fields }
  }

  public async updateRecord(
    dataEntityId: string,
    id: string,
    fields: Record<string, any>
  ): Promise<MasterDataRecord> {
    await this.http.patch(`/${dataEntityId}/documents/${id}`, fields)

    return { id, dataEntityId, fields }
  }

  public async deleteRecord(
    dataEntityId: string,
    id: string
  ): Promise<boolean> {
    await this.http.delete(`/${dataEntityId}/documents/${id}`)

    return true
  }

  public async getSchema(dataEntityId: string): Promise<any> {
    return this.http.get(`/${dataEntityId}/dataentity`)
  }
}
