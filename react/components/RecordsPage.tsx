import React, { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { defineMessages, useIntl } from 'react-intl'
import { withRuntimeContext } from 'vtex.render-runtime'
import {
  Alert,
  Button,
  Layout,
  PageBlock,
  PageHeader,
  Spinner,
} from 'vtex.styleguide'

import GET_COLUMN_PREFS from '../graphql/getColumnPrefs.gql'
import SAVE_COLUMN_PREFS from '../graphql/saveColumnPrefs.gql'
import {
  createRecord,
  deleteRecord,
  fetchFullSchema,
  saveSchema,
  searchRecords,
  updateRecord,
} from '../services/masterdata'
import { ColumnsModal } from './modals/ColumnsModal'
import { DeleteAllModal } from './modals/DeleteAllModal'
import { DeleteRecordModal } from './modals/DeleteRecordModal'
import { EditRecordModal } from './modals/EditRecordModal'
import { SearchQueryModal } from './modals/SearchQueryModal'
import { TriggersModal } from './modals/TriggersModal'
import { ViewRecordModal } from './modals/ViewRecordModal'
import { RecordsTable } from './RecordsTable'

const messages = defineMessages({
  title: { id: 'masterdatav2.records.title' },
  subtitle: { id: 'masterdatav2.records.subtitle' },
  searchPlaceholder: { id: 'masterdatav2.records.search-placeholder' },
  addButton: { id: 'masterdatav2.records.add-button' },
  saveButton: { id: 'masterdatav2.records.save-button' },
  cancelButton: { id: 'masterdatav2.records.cancel-button' },
  confirmDelete: { id: 'masterdatav2.records.confirm-delete' },
  emptyState: { id: 'masterdatav2.records.empty-state' },
  successSave: { id: 'masterdatav2.success-save' },
  successDelete: { id: 'masterdatav2.success-delete' },
  error: { id: 'masterdatav2.error' },
  backButton: { id: 'masterdatav2.back-button' },
  columnsButton: { id: 'masterdatav2.records.columns-button' },
  columnsModalTitle: { id: 'masterdatav2.records.columns-modal-title' },
  columnsEmpty: { id: 'masterdatav2.records.columns-empty' },
  triggersButton: { id: 'masterdatav2.records.triggers-button' },
  triggersModalTitle: {
    id: 'masterdatav2.records.triggers-modal-title',
  },
  addTrigger: { id: 'masterdatav2.records.add-trigger' },
  editTrigger: { id: 'masterdatav2.records.edit-trigger' },
  noTriggers: { id: 'masterdatav2.records.no-triggers' },
  unauthorizedError: { id: 'masterdatav2.unauthorized-error' },
})

function getQueryParam(name: string): string {
  if (typeof window === 'undefined') return ''

  return new URLSearchParams(window.location.search).get(name) ?? ''
}

const HIDDEN_KEYS = new Set(['_href', 'userId'])

const RecordsPage: React.FC<{ runtime: any }> = ({ runtime }) => {
  const intl = useIntl()
  const entityId = getQueryParam('entity')
  const schemaName = getQueryParam('schema')

  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchWhere, setSearchWhere] = useState('')
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [alert, setAlert] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record<
    string,
    any
  > | null>(null)
  const [fieldsJson, setFieldsJson] = useState('{}')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | string[] | null>(null)
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0 })
  const [tableKey, setTableKey] = useState(0)

  const [availableColumns, setAvailableColumns] = useState<string[]>([])
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false)
  const [selectedColumnsSet, setSelectedColumnsSet] = useState<Set<string>>(
    new Set()
  )

  const [viewingRecord, setViewingRecord] = useState<Record<
    string,
    any
  > | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'fields' | 'json'>('fields')

  const [fullSchema, setFullSchema] = useState<any>(null)
  const [isTriggersModalOpen, setIsTriggersModalOpen] = useState(false)

  const goBack = () => runtime.navigate({ page: 'admin.app.masterdatav2' })

  const showAlert = (type: 'success' | 'error', id: string) =>
    setAlert({ type, message: intl.formatMessage({ id }) })

  const { data: prefsData, refetch: refetchPrefs } = useQuery(
    GET_COLUMN_PREFS,
    {
      variables: { entityName: entityId, schemaName: schemaName },
      skip: !entityId || !schemaName,
      fetchPolicy: 'network-only',
    }
  )

  const [saveColumnPrefsMutation, { loading: savingPrefs }] =
    useMutation(SAVE_COLUMN_PREFS)

  const load = useCallback(() => {
    if (!entityId || !schemaName) return

    setLoading(true)
    setAlert(null)
    searchRecords(entityId, schemaName, page, pageSize, searchWhere)
      .then(({ records: recs, total: t }) => {
        setRecords(recs)
        setTotal(t)
        setLoading(false)
      })
      .catch((err: any) => {
        if (
          err.message &&
          (err.message.includes('401') || err.message.includes('403'))
        ) {
          showAlert('error', 'masterdatav2.unauthorized-error')
        } else {
          showAlert('error', 'masterdatav2.error')
        }
        console.error(err)
        setLoading(false)
      })
  }, [entityId, schemaName, page, pageSize, searchWhere, refetchPrefs])

  if (!fullSchema && availableColumns.length === 0) {
    fetchFullSchema(entityId, schemaName)
      .then(schema => {
        setFullSchema(schema)
        if (schema.properties) {
          setAvailableColumns(Object.keys(schema.properties))
        }
      })
      .catch(err => {
        console.error('Failed to load schema', err)
      })
  }

  useEffect(() => {
    load()
  }, [load])

  const savedColumns = prefsData?.getColumnPrefs
  let columnKeys: string[] = []

  if (savedColumns && savedColumns.length > 0) {
    columnKeys = savedColumns
  } else if (availableColumns.length > 0) {
    columnKeys = availableColumns
  } else if (records.length > 0) {
    columnKeys = Object.keys(records[0]).filter(k => !HIDDEN_KEYS.has(k))
  } else {
    columnKeys = ['id']
  }

  const handleView = (record: Record<string, any>) => {
    setViewingRecord(record)
    setViewMode('fields')
    setIsViewModalOpen(true)
  }

  const handleEdit = (record: Record<string, any>) => {
    const { _href, ...rest } = record

    setEditingRecord(record)
    setFieldsJson(JSON.stringify(rest, null, 2))
    setJsonError(null)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingRecord(null)
    setFieldsJson('{}')
    setJsonError(null)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    let parsed: Record<string, any>

    try {
      parsed = JSON.parse(fieldsJson)

      // Enforce types based on schema definition
      if (fullSchema?.properties) {
        for (const key of Object.keys(parsed)) {
          const propDef = fullSchema.properties[key]
          if (propDef && parsed[key] !== null && parsed[key] !== undefined) {
            const type = propDef.type
            if (
              (type === 'integer' || type === 'number') &&
              typeof parsed[key] !== 'number'
            ) {
              const num = Number(parsed[key])
              if (!isNaN(num)) parsed[key] = num
            } else if (type === 'boolean' && typeof parsed[key] !== 'boolean') {
              parsed[key] =
                parsed[key] === 'true' ||
                parsed[key] === true ||
                parsed[key] === 1
            } else if (type === 'string' && typeof parsed[key] !== 'string') {
              parsed[key] =
                typeof parsed[key] === 'object'
                  ? JSON.stringify(parsed[key])
                  : String(parsed[key])
            }
          }
        }
      }
    } catch {
      setJsonError('Invalid JSON — please fix before saving.')
      return
    }

    setSaving(true)
    try {
      if (editingRecord?.id) {
        const { id, accountId, _href, ...body } = parsed

        const changedFields: Record<string, any> = {}

        // Find modified or new fields
        for (const key of Object.keys(body)) {
          if (
            JSON.stringify(body[key]) !== JSON.stringify(editingRecord[key])
          ) {
            changedFields[key] = body[key]
          }
        }

        // Find deleted fields (removed from JSON)
        for (const key of Object.keys(editingRecord)) {
          if (
            key !== 'id' &&
            key !== 'accountId' &&
            key !== '_href' &&
            !(key in body)
          ) {
            changedFields[key] = null
          }
        }

        if (Object.keys(changedFields).length > 0) {
          await updateRecord(
            entityId,
            schemaName,
            editingRecord.id,
            changedFields
          )
        }
      } else {
        const { id, accountId, _href, ...body } = parsed
        await createRecord(entityId, schemaName, body)
      }

      setIsModalOpen(false)
      showAlert('success', 'masterdatav2.success-save')
      load()
    } catch (err) {
      if (
        (err as any).message &&
        ((err as any).message.includes('401') ||
          (err as any).message.includes('403'))
      ) {
        showAlert('error', 'masterdatav2.unauthorized-error')
      } else {
        showAlert('error', 'masterdatav2.error')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    setDeleting(true)
    try {
      if (Array.isArray(deletingId)) {
        setDeleteProgress({ current: 0, total: deletingId.length })
        for (let i = 0; i < deletingId.length; i++) {
          const docId = deletingId[i]
          if (docId) {
            await deleteRecord(entityId, docId)
          }
          setDeleteProgress({ current: i + 1, total: deletingId.length })
        }
      } else {
        await deleteRecord(entityId, deletingId)
      }
      setIsDeleteModalOpen(false)
      showAlert('success', 'masterdatav2.success-delete')
      setTableKey(k => k + 1)
      load()
    } catch (err) {
      if (
        (err as any).message &&
        ((err as any).message.includes('401') ||
          (err as any).message.includes('403'))
      ) {
        showAlert('error', 'masterdatav2.unauthorized-error')
      } else {
        showAlert('error', 'masterdatav2.error')
      }
    } finally {
      setDeleting(false)
      setDeletingId(null)
      setDeleteProgress({ current: 0, total: 0 })
    }
  }

  const handleConfirmDeleteAll = async () => {
    setIsDeleteAllModalOpen(false)
    setDeleting(true)
    setDeleteProgress({ current: 0, total: total })
    try {
      let deletedCount = 0
      let hasMore = true
      while (hasMore) {
        // Buscamos sempre a página 1 porque estamos deletando os itens
        const { records: batch } = await searchRecords(
          entityId,
          schemaName,
          1,
          50,
          searchWhere
        )
        if (batch.length === 0) {
          hasMore = false
          break
        }
        for (const record of batch) {
          await deleteRecord(entityId, record.id)
          deletedCount++
          setDeleteProgress({ current: deletedCount, total: total })
        }
      }
      showAlert('success', 'masterdatav2.success-delete')
      setTableKey(k => k + 1)
      load()
    } catch (err) {
      if (
        (err as any).message &&
        ((err as any).message.includes('401') ||
          (err as any).message.includes('403'))
      ) {
        showAlert('error', 'masterdatav2.unauthorized-error')
      } else {
        showAlert('error', 'masterdatav2.error')
      }
    } finally {
      setDeleting(false)
      setDeleteProgress({ current: 0, total: 0 })
    }
  }

  const handleApplySearch = (where: string) => {
    setSearchWhere(where)
    setPage(1)
  }

  const handleOpenTriggersModal = async () => {
    try {
      setLoading(true)
      const schemaData = await fetchFullSchema(entityId, schemaName)
      setFullSchema(schemaData)
      setIsTriggersModalOpen(true)
    } catch (err) {
      showAlert('error', 'masterdatav2.error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSchema = async (updatedSchema: any) => {
    try {
      await saveSchema(entityId, schemaName, updatedSchema)
      setFullSchema(updatedSchema)
      showAlert('success', 'masterdatav2.success-save')
    } catch {
      showAlert('error', 'masterdatav2.error')
      throw new Error('Failed to save')
    }
  }

  const handleDeleteTriggerSchema = async (updatedSchema: any) => {
    try {
      setLoading(true)
      await saveSchema(entityId, schemaName, updatedSchema)
      setFullSchema(updatedSchema)
      showAlert('success', 'masterdatav2.success-delete')
    } catch {
      showAlert('error', 'masterdatav2.error')
      throw new Error('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenColumnsModal = () => {
    const columnsToSelect =
      availableColumns.length > 0 ? availableColumns : columnKeys

    setSelectedColumnsSet(new Set(columnKeys))

    if (availableColumns.length === 0) {
      setAvailableColumns(Array.from(new Set([...columnKeys])))
    }

    setIsColumnsModalOpen(true)
  }

  const handleSaveColumns = async () => {
    const fields = Array.from(selectedColumnsSet)

    try {
      await saveColumnPrefsMutation({
        variables: { entityName: entityId, schemaName: schemaName, fields },
      })
      setIsColumnsModalOpen(false)
      refetchPrefs()
    } catch {
      showAlert('error', 'masterdatav2.error')
    }
  }

  if (!entityId || !schemaName) {
    return (
      <Layout
        pageHeader={
          <PageHeader
            title={intl.formatMessage(messages.title)}
            linkLabel={intl.formatMessage(messages.backButton)}
            onLinkClick={goBack}
          />
        }
      >
        <PageBlock variation="full">
          <div className="flex flex-column items-center justify-center pv9 tc">
            <p className="f5 c-muted-1">No entity or schema selected.</p>
            <Button variation="primary" onClick={goBack}>
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
          onLinkClick={goBack}
        >
          <Button variation="primary" onClick={handleAdd}>
            + {intl.formatMessage(messages.addButton)}
          </Button>
        </PageHeader>
      }
    >
      {alert && (
        <div className="mb5">
          <Alert type={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      <PageBlock variation="full">
        <div className="flex gap3 mb5 items-center">
          <div className="flex-auto mr3">
            {searchWhere ? (
              <div
                className="pa3 ba b--muted-4 br2 f6 bg-muted-5 c-on-base"
                style={{ wordBreak: 'break-all' }}
              >
                <span className="fw6 c-muted-2 mr2">Active Filter:</span>
                <code>{searchWhere}</code>
              </div>
            ) : (
              <p className="c-muted-2 ma0 f6">
                No filters applied. Showing all records.
              </p>
            )}
          </div>
          <Button
            variation="secondary"
            onClick={() => setIsSearchModalOpen(true)}
          >
            Search
          </Button>
          {searchWhere && (
            <div className="ml3">
              <Button
                variation="danger"
                onClick={() => {
                  setSearchWhere('')
                  setPage(1)
                }}
              >
                Clear
              </Button>
            </div>
          )}
          <div className="ml3">
            <Button variation="secondary" onClick={handleOpenColumnsModal}>
              {intl.formatMessage(messages.columnsButton)}
            </Button>
          </div>
          <div className="ml3">
            <Button variation="secondary" onClick={handleOpenTriggersModal}>
              {intl.formatMessage({
                id: 'masterdatav2.records.triggers-button',
                defaultMessage: 'Triggers',
              })}
            </Button>
          </div>
          {total > 0 && (
            <div className="ml3">
              <Button
                variation="danger"
                onClick={() => setIsDeleteAllModalOpen(true)}
              >
                Delete All
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center pa8">
            <Spinner />
          </div>
        ) : (
          <RecordsTable
            tableKey={String(tableKey)}
            records={records}
            total={total}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            emptyStateLabel={intl.formatMessage(messages.emptyState)}
            columnKeys={columnKeys}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={id => {
              setDeletingId(id)
              setIsDeleteModalOpen(true)
            }}
            onBulkDelete={(ids: string[]) => {
              setDeletingId(ids)
              setIsDeleteModalOpen(true)
            }}
          />
        )}
      </PageBlock>

      <ColumnsModal
        isOpen={isColumnsModalOpen}
        onClose={() => setIsColumnsModalOpen(false)}
        onSave={handleSaveColumns}
        savingPrefs={savingPrefs}
        availableColumns={availableColumns}
        selectedColumnsSet={selectedColumnsSet}
        setSelectedColumnsSet={setSelectedColumnsSet}
      />

      <EditRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        saving={saving}
        editingRecord={editingRecord}
        fieldsJson={fieldsJson}
        setFieldsJson={setFieldsJson}
        jsonError={jsonError}
        setJsonError={setJsonError}
        fullSchema={fullSchema}
      />

      <DeleteRecordModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        deleting={deleting}
        deletingId={deletingId}
        deleteProgress={deleteProgress}
      />

      <DeleteAllModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleConfirmDeleteAll}
        deleting={deleting}
        total={total}
      />

      <ViewRecordModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        viewingRecord={viewingRecord}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <TriggersModal
        isOpen={isTriggersModalOpen}
        onClose={() => setIsTriggersModalOpen(false)}
        onSave={handleSaveSchema}
        onDelete={handleDeleteTriggerSchema}
        fullSchema={fullSchema}
      />

      <SearchQueryModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onApply={handleApplySearch}
        initialWhere={searchWhere}
        fields={availableColumns}
      />
    </Layout>
  )
}

export default withRuntimeContext(RecordsPage)
