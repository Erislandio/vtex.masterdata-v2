const BASE_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

export async function fetchSchemaProperties(
  entity: string,
  schema: string
): Promise<string[]> {
  try {
    const url = `/api/dataentities/${entity}/schemas/${schema}`
    const res = await fetch(url, {
      headers: BASE_HEADERS,
      credentials: 'include',
    })

    if (!res.ok) return []
    const data = await res.json()

    return data.properties ? Object.keys(data.properties) : []
  } catch {
    return []
  }
}

export async function fetchFullSchema(
  entity: string,
  schema: string
): Promise<any> {
  const url = `/api/dataentities/${entity}/schemas/${schema}`
  const res = await fetch(url, {
    headers: BASE_HEADERS,
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export async function saveSchema(
  entity: string,
  schema: string,
  body: any
): Promise<void> {
  const url = `/api/dataentities/${entity}/schemas/${schema}`
  const res = await fetch(url, {
    method: 'PUT',
    headers: BASE_HEADERS,
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}

export async function searchRecords(
  entity: string,
  schema: string,
  page: number,
  pageSize: number,
  where: string
): Promise<{ records: Record<string, any>[]; total: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const params = new URLSearchParams({
    _schema: schema,
    _sort: 'createdIn desc',
    _fields: '_all',
    ...(where ? { _where: where } : {}),
  })

  const res = await fetch(
    `/api/dataentities/${entity}/search?${params.toString()}`,
    {
      headers: {
        ...BASE_HEADERS,
        'REST-Range': `resources=${from}-${to}`,
      },
      credentials: 'include',
    }
  )

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)

  const range = res.headers.get('REST-Content-Range') ?? ''
  const totalMatch = range.match(/\/(\d+)/)
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 0

  const records: Record<string, any>[] = await res.json()

  return { records, total }
}

export async function createRecord(
  entity: string,
  schema: string,
  body: Record<string, any>
): Promise<void> {
  const res = await fetch(
    `/api/dataentities/${entity}/documents?_schema=${schema}`,
    {
      method: 'POST',
      headers: BASE_HEADERS,
      credentials: 'include',
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}

export async function updateRecord(
  entity: string,
  schema: string,
  id: string,
  body: Record<string, any>
): Promise<void> {
  const res = await fetch(
    `/api/dataentities/${entity}/documents/${id}?_schema=${schema}`,
    {
      method: 'PATCH',
      headers: BASE_HEADERS,
      credentials: 'include',
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}

export async function deleteRecord(entity: string, id: string): Promise<void> {
  const res = await fetch(`/api/dataentities/${entity}/documents/${id}`, {
    method: 'DELETE',
    headers: BASE_HEADERS,
    credentials: 'include',
  })

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}
