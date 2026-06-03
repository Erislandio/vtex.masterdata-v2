import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-apollo'
import { defineMessages, useIntl } from 'react-intl'
import { withRuntimeContext } from 'vtex.render-runtime'
import {
  Alert,
  Button,
  Card,
  IconDelete,
  Input,
  Layout,
  Modal,
  PageBlock,
  PageHeader,
  Spinner,
} from 'vtex.styleguide'

import DELETE_ENTITY from '../graphql/deleteEntity.gql'
import GET_ENTITIES from '../graphql/getEntities.gql'
import SAVE_ENTITY from '../graphql/saveEntity.gql'

const messages = defineMessages({
  title: { id: 'masterdatav2.page-title' },
  addButton: { id: 'masterdatav2.entity.add-button' },
  modalTitle: { id: 'masterdatav2.entity.modal-title' },
  entityName: { id: 'masterdatav2.entity.name-label' },
  schemaName: { id: 'masterdatav2.entity.schema-label' },
  entityPlaceholder: { id: 'masterdatav2.entity.name-placeholder' },
  schemaPlaceholder: { id: 'masterdatav2.entity.schema-placeholder' },
  saveButton: { id: 'masterdatav2.records.save-button' },
  cancelButton: { id: 'masterdatav2.records.cancel-button' },
  emptyState: { id: 'masterdatav2.entity.empty-state' },
  openRecords: { id: 'masterdatav2.entity.open-records' },
  openSchema: { id: 'masterdatav2.entity.open-schema' },
  deleteConfirm: { id: 'masterdatav2.entity.delete-confirm' },
  validationError: { id: 'masterdatav2.entity.validation-error' },
  error: { id: 'masterdatav2.error' },
})

interface AppEntity {
  id: string
  entityName: string
  schemaName: string
  createdAt: string
}

interface Props {
  runtime: any
}

const AdminApp: React.FC<Props> = ({ runtime }) => {
  const intl = useIntl()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [entityName, setEntityName] = useState('')
  const [schemaName, setSchemaName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, loading, error, refetch } = useQuery<{
    getEntities: AppEntity[]
  }>(GET_ENTITIES, { fetchPolicy: 'network-only' })

  const [saveEntity, { loading: saving }] = useMutation(SAVE_ENTITY, {
    onCompleted: () => {
      setIsModalOpen(false)
      refetch()
    },
    onError: () => setFormError(intl.formatMessage(messages.error)),
  })

  const [deleteEntity] = useMutation(DELETE_ENTITY, {
    onCompleted: () => {
      setDeletingId(null)
      refetch()
    },
  })

  const openModal = () => {
    setEntityName('')
    setSchemaName('')
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!entityName.trim() || !schemaName.trim()) {
      setFormError(intl.formatMessage(messages.validationError))

      return
    }

    saveEntity({
      variables: {
        entityName: entityName.trim(),
        schemaName: schemaName.trim(),
      },
    })
  }

  const handleDeleteClick = (id: string) => {
    if (deletingId === id) {
      deleteEntity({ variables: { id } })
    } else {
      setDeletingId(id)
    }
  }

  const entities: AppEntity[] = data?.getEntities ?? []

  return (
    <Layout
      pageHeader={
        <PageHeader title={intl.formatMessage(messages.title)}>
          <Button variation="primary" onClick={openModal}>
            + {intl.formatMessage(messages.addButton)}
          </Button>
        </PageHeader>
      }
    >
      <PageBlock variation="full">
        {loading && (
          <div className="flex justify-center pa8">
            <Spinner />
          </div>
        )}

        {error && !loading && (
          <div className="mb5">
            <Alert type="error">{intl.formatMessage(messages.error)}</Alert>
          </div>
        )}

        {!loading && !error && entities.length === 0 && (
          <div className="flex flex-column items-center justify-center pv9 tc">
            <span className="f1 mb5">🗄️</span>
            <p className="f5 c-muted-1 mb6">
              {intl.formatMessage(messages.emptyState)}
            </p>
            <Button variation="primary" onClick={openModal}>
              + {intl.formatMessage(messages.addButton)}
            </Button>
          </div>
        )}

        {!loading && entities.length > 0 && (
          <div className="flex flex-wrap nl4 nr4">
            {entities.map(entity => (
              <div key={entity.id} className="w-third-ns w-50-m w-100 pa4">
                <Card>
                  <div
                    className="flex flex-column pa3"
                    style={{ minHeight: 220, justifyContent: 'space-between' }}
                  >
                    <div className="flex items-start justify-between mb4">
                      <span className="f2">🗄️</span>
                      <button
                        className={`bn pointer pa2 br2 flex items-center justify-center ${
                          deletingId === entity.id
                            ? 'bg-danger--faded c-danger'
                            : 'bg-transparent c-muted-3'
                        }`}
                        title={
                          deletingId === entity.id
                            ? intl.formatMessage(messages.deleteConfirm)
                            : 'Delete'
                        }
                        onClick={() => handleDeleteClick(entity.id)}
                      >
                        <IconDelete size={16} />
                      </button>
                    </div>

                    <h3 className="f4 fw7 mt0 mb1 c-on-base truncate">
                      {entity.entityName}
                    </h3>
                    <p className="f6 c-muted-2 mt0 mb1">
                      <span className="fw5">Schema:</span> {entity.schemaName}
                    </p>
                    <p className="f7 c-muted-3 mt0 mb5">
                      {new Date(entity.createdAt).toLocaleDateString()}
                    </p>

                    {deletingId === entity.id && (
                      <p className="f7 c-danger tc mb3 mt0">
                        {intl.formatMessage(messages.deleteConfirm)}
                      </p>
                    )}

                    <div
                      className="flex gap3 mt-auto"
                      style={{
                        gap: '1rem',
                      }}
                    >
                      <Button
                        variation="primary"
                        block
                        onClick={() =>
                          runtime.navigate({
                            page: 'admin.app.masterdatav2-records',
                            query: `entity=${entity.entityName}&schema=${entity.schemaName}`,
                          })
                        }
                      >
                        {intl.formatMessage(messages.openRecords)}
                      </Button>

                      <Button
                        variation="secondary"
                        block
                        onClick={() =>
                          runtime.navigate({
                            page: 'admin.app.masterdatav2-schema',
                            query: `entity=${entity.entityName}&schema=${entity.schemaName}`,
                          })
                        }
                      >
                        {intl.formatMessage(messages.openSchema)}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </PageBlock>

      <Modal
        isOpen={isModalOpen}
        title={intl.formatMessage(messages.modalTitle)}
        onClose={() => setIsModalOpen(false)}
        bottomBar={
          <div className="flex justify-end gap3" style={{ gap: '1rem' }}>
            <Button variation="tertiary" onClick={() => setIsModalOpen(false)}>
              {intl.formatMessage(messages.cancelButton)}
            </Button>
            <Button variation="primary" onClick={handleSave} isLoading={saving}>
              {intl.formatMessage(messages.saveButton)}
            </Button>
          </div>
        }
      >
        <div className="pa4">
          {formError && (
            <div className="mb5">
              <Alert type="error" onClose={() => setFormError(null)}>
                {formError}
              </Alert>
            </div>
          )}

          <div className="mb5">
            <Input
              label={intl.formatMessage(messages.entityName)}
              placeholder={intl.formatMessage(messages.entityPlaceholder)}
              value={entityName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEntityName(e.target.value)
              }
            />
          </div>

          <div className="mb2">
            <Input
              label={intl.formatMessage(messages.schemaName)}
              placeholder={intl.formatMessage(messages.schemaPlaceholder)}
              value={schemaName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSchemaName(e.target.value)
              }
            />
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

export default withRuntimeContext(AdminApp)
