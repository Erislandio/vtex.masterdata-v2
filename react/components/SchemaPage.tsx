import React, { useCallback, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { withRuntimeContext } from 'vtex.render-runtime'
import {
  Alert,
  Button,
  Layout,
  PageBlock,
  PageHeader,
  Spinner,
  Table,
} from 'vtex.styleguide'
import { JsonViewer } from './JsonViewer'

const messages = defineMessages({
  title: { id: 'masterdatav2.schema.title' },
  subtitle: { id: 'masterdatav2.schema.subtitle' },
  fieldName: { id: 'masterdatav2.field-name' },
  fieldType: { id: 'masterdatav2.field-type' },
  fieldRequired: { id: 'masterdatav2.field-required' },
  error: { id: 'masterdatav2.error' },
  backButton: { id: 'masterdatav2.back-button' },
  noEntity: { id: 'masterdatav2.schema.no-entity' },
  emptyFields: { id: 'masterdatav2.schema.empty-fields' },
})

interface MDProperty {
  type: string
  title?: string
  description?: string
  link?: string
  enum?: string[]
  enumNames?: string[]
  properties?: Record<string, MDProperty> // nested object
}

interface MDSchema {
  properties: Record<string, MDProperty>
  required?: string[]
  'v-indexed'?: string[]
  'v-default-fields'?: string[]
  'v-security'?: {
    allowGetAll?: boolean
    publicRead?: string[]
    publicWrite?: string[]
    publicFilter?: string[]
  }
  'v-triggers'?: {
    name: string
    active: boolean
    condition: string
    action: any
  }[]
}

interface FieldRow {
  name: string
  type: string
  title: string
  description: string
  required: boolean
  indexed: boolean
  defaultField: boolean
  hasEnum: boolean
  nested: boolean
}

const TYPE_BADGE: Record<string, { bg: string }> = {
  string: { bg: '#1a73e8' },
  integer: { bg: '#e8710a' },
  number: { bg: '#f9ab00' },
  boolean: { bg: '#1e8e3e' },
  object: { bg: '#8430ce' },
  array: { bg: '#d93025' },
}

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  if (!type)
    return (
      <span
        className="br2 ph2 pv1 f7 fw6 white dib"
        style={{ background: '#5f6368', minWidth: 52, textAlign: 'center' }}
      >
        None
      </span>
    )

  if (typeof type === 'object')
    return (
      <span
        className="br2 ph2 pv1 f7 fw6 white dib"
        style={{ background: '#8430ce', minWidth: 52, textAlign: 'center' }}
      >
        Object
      </span>
    )

  const meta = TYPE_BADGE[type?.toLowerCase()] ?? { bg: '#5f6368' }

  return (
    <span
      className="br2 ph2 pv1 f7 fw6 white dib"
      style={{ background: meta.bg, minWidth: 52, textAlign: 'center' }}
    >
      {type || '—'}
    </span>
  )
}

const BoolCell: React.FC<{ value: boolean }> = ({ value }) => (
  <span className={value ? 'c-success fw6' : 'c-muted-3'}>
    {value ? '✓' : '—'}
  </span>
)

function getQueryParam(name: string): string {
  if (typeof window === 'undefined') return ''

  return new URLSearchParams(window.location.search).get(name) ?? ''
}

async function fetchSchema(entity: string, schema: string): Promise<MDSchema> {
  const url = `/api/dataentities/${entity}/schemas/${schema}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include', // sends the VTEX session cookie
  })

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`)
  }

  return res.json()
}

function flattenProperties(data: MDSchema): FieldRow[] {
  const {
    properties = {},
    required = [],
    'v-indexed': indexed = [],
    'v-default-fields': defaultFields = [],
  } = data

  return Object.entries(properties).map(([name, def]) => ({
    name,
    type: def.type ?? '—',
    title: def.title ?? '',
    description: def.description ?? '',
    required: required.includes(name),
    indexed: indexed.includes(name),
    defaultField: defaultFields.includes(name),
    hasEnum: Array.isArray(def.enum) && def.enum.length > 0,
    nested: def.type === 'object' && !!def.properties,
  }))
}

const SchemaPage: React.FC<any> = ({ runtime }) => {
  const intl = useIntl()
  const entityId = getQueryParam('entity')
  const schemaName = getQueryParam('schema')

  console.log(entityId)

  const [schemaData, setSchemaData] = useState<MDSchema | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!entityId || !schemaName) return

    setLoading(true)
    setError(null)
    fetchSchema(entityId, schemaName)
      .then(data => {
        setSchemaData(data)
        setLoading(false)
      })
      .catch(err => {
        if (
          err.message &&
          (err.message.includes('401') || err.message.includes('403'))
        ) {
          setError(
            intl.formatMessage({
              id: 'masterdatav2.unauthorized-error',
            })
          )
        } else {
          setError(err.message ?? intl.formatMessage(messages.error))
        }
        setLoading(false)
      })
  }, [entityId, schemaName, intl])

  useEffect(() => {
    load()
  }, [load])

  const fields = schemaData ? flattenProperties(schemaData) : []
  const security = schemaData?.['v-security']

  const tableSchema = {
    properties: {
      name: {
        title: intl.formatMessage(messages.fieldName),
        width: 200,
        cellRenderer: ({ cellData, rowData }: any) => (
          <div className="flex items-center gap2">
            <span className="fw6 f6">{cellData}</span>
            {rowData.nested && (
              <span className="f7 c-muted-3 ml2">(object)</span>
            )}
          </div>
        ),
      },
      type: {
        title: intl.formatMessage(messages.fieldType),
        width: 100,
        cellRenderer: ({ cellData }: any) => <TypeBadge type={cellData} />,
      },
      title: {
        title: 'Title',
        width: 200,
        cellRenderer: ({ cellData }: any) => (
          <span className="f6 c-muted-1">{cellData || '—'}</span>
        ),
      },
      required: {
        title: intl.formatMessage(messages.fieldRequired),
        width: 90,
        cellRenderer: ({ cellData }: any) => <BoolCell value={cellData} />,
      },
      indexed: {
        title: 'Indexed',
        width: 90,
        cellRenderer: ({ cellData }: any) => <BoolCell value={cellData} />,
      },
      defaultField: {
        title: 'Default',
        width: 90,
        cellRenderer: ({ cellData }: any) => <BoolCell value={cellData} />,
      },
      hasEnum: {
        title: 'Enum',
        width: 80,
        cellRenderer: ({ cellData }: any) => <BoolCell value={cellData} />,
      },
    },
  }

  const goHome = () => runtime.navigate({ page: 'admin.app.masterdatav2' })

  if (!entityId || !schemaName) {
    return (
      <Layout
        pageHeader={
          <PageHeader
            title={intl.formatMessage(messages.title)}
            linkLabel={intl.formatMessage(messages.backButton)}
            onLinkClick={goHome}
          />
        }
      >
        <PageBlock variation="full">
          <div className="flex flex-column items-center justify-center pv9 tc">
            <span className="f1 mb4">🗂️</span>
            <p className="f5 c-muted-1">
              {intl.formatMessage(messages.noEntity)}
            </p>
            <Button variation="primary" onClick={goHome}>
              {intl.formatMessage(messages.backButton)}
            </Button>
          </div>
        </PageBlock>
      </Layout>
    )
  }

  return (
    <Layout
      pageHeader={
        <PageHeader
          title={`${entityId} / ${schemaName}`}
          subtitle={intl.formatMessage(messages.subtitle)}
          linkLabel={intl.formatMessage(messages.backButton)}
          onLinkClick={goHome}
        >
          <Button variation="secondary" onClick={load}>
            ↻ Refresh
          </Button>
        </PageHeader>
      }
    >
      {error && (
        <div className="mb5">
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {schemaData && !loading && (
        <PageBlock>
          <div className="flex flex-wrap items-center justify-between pv2 gap4">
            <div>
              <p className="f7 fw5 c-muted-2 ma0 ttu tracked">Entity</p>
              <p className="f4 fw7 c-on-base ma0">{entityId}</p>
            </div>
            <div>
              <p className="f7 fw5 c-muted-2 ma0 ttu tracked">Schema</p>
              <p className="f4 fw7 c-on-base ma0">{schemaName}</p>
            </div>
            <div>
              <p className="f7 fw5 c-muted-2 ma0 ttu tracked">Fields</p>
              <p className="f4 fw7 c-on-base ma0">{fields.length}</p>
            </div>
            <div>
              <p className="f7 fw5 c-muted-2 ma0 ttu tracked">Required</p>
              <p className="f4 fw7 c-danger ma0">
                {schemaData.required?.length ?? 0}
              </p>
            </div>
            <div>
              <p className="f7 fw5 c-muted-2 ma0 ttu tracked">Indexed</p>
              <p className="f4 fw7 c-action-primary ma0">
                {schemaData['v-indexed']?.length ?? 0}
              </p>
            </div>
            <div>
              <Button
                variation="primary"
                onClick={() =>
                  runtime.navigate({
                    page: 'admin.app.masterdatav2-records',
                    query: `entity=${entityId}&schema=${schemaName}`,
                  })
                }
              >
                View Records →
              </Button>
            </div>
          </div>
        </PageBlock>
      )}

      <PageBlock variation="full">
        {loading ? (
          <div className="flex justify-center pa8">
            <Spinner />
          </div>
        ) : (
          <Table
            schema={tableSchema}
            items={fields}
            emptyStateLabel={intl.formatMessage(messages.emptyFields)}
          />
        )}
      </PageBlock>

      {security && !loading && (
        <PageBlock>
          <h3 className="f5 fw6 mt0 mb4 c-on-base">Security</h3>
          <div className="flex flex-wrap gap4">
            <div>
              <p className="f7 fw5 c-muted-2 ma0 mb2 ttu tracked">
                Allow Get All
              </p>
              <BoolCell value={security.allowGetAll ?? false} />
            </div>
            <div>
              <p className="f7 fw5 c-muted-2 ma0 mb2 ttu tracked">
                Public Read
              </p>
              <p className="f6 ma0">{security.publicRead?.join(', ') || '—'}</p>
            </div>
            <div>
              <p className="f7 fw5 c-muted-2 ma0 mb2 ttu tracked">
                Public Write
              </p>
              <p className="f6 ma0">
                {security.publicWrite?.join(', ') || '—'}
              </p>
            </div>
            <div>
              <p className="f7 fw5 c-muted-2 ma0 mb2 ttu tracked">
                Public Filter
              </p>
              <p className="f6 ma0">
                {security.publicFilter?.join(', ') || '—'}
              </p>
            </div>
          </div>
        </PageBlock>
      )}

      {schemaData?.['v-triggers'] &&
        schemaData['v-triggers'].length > 0 &&
        !loading && (
          <PageBlock>
            <div className="flex items-center justify-between mb4">
              <h3 className="f5 fw6 ma0 c-on-base">Triggers</h3>
              <span className="br-pill bg-muted-4 ph3 pv1 f6 fw5 c-muted-1">
                {schemaData['v-triggers'].length} configured
              </span>
            </div>

            <div className="flex flex-column gap4">
              {schemaData['v-triggers'].map((trigger, i) => (
                <div key={i} className="ba b--muted-4 br2 pa5">
                  <div className="flex items-center justify-between mb4 pb3 bb b--muted-5">
                    <div className="flex items-center gap3">
                      <span className="f4 fw6 c-on-base">
                        {trigger.name || `Trigger #${i + 1}`}
                      </span>
                      <span
                        className={`br2 ph2 pv1 f7 fw6 white ${
                          trigger.active ? 'bg-success' : 'bg-muted-3'
                        }`}
                      >
                        {trigger.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap5">
                    <div className="w-100 w-40-l">
                      <p className="f7 fw5 c-muted-2 ma0 mb2 ttu tracked">
                        Condition
                      </p>
                      <div
                        className="pa3 bg-muted-5 br2 f6"
                        style={{ wordBreak: 'break-all' }}
                      >
                        <span className="c-on-base fw5">
                          {trigger.condition || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="w-100 w-50-l flex-auto">
                      <p className="f7 fw5 c-muted-2 ma0 mb2 ttu tracked">
                        Action
                      </p>
                      <div className="pa3 bg-muted-5 br2 f6 overflow-x-auto">
                        <JsonViewer data={trigger.action} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PageBlock>
        )}
    </Layout>
  )
}

export default withRuntimeContext(SchemaPage)
