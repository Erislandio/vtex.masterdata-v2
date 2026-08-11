import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Button, Modal } from 'vtex.styleguide'

const messages = defineMessages({
  confirmDelete: { id: 'masterdatav2.records.confirm-delete' },
  cancelButton: { id: 'masterdatav2.records.cancel-button' },
})

interface DeleteRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
  deletingId: string | string[] | null
  deleteProgress?: { current: number; total: number }
}

export const DeleteRecordModal: React.FC<DeleteRecordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  deleting,
  deletingId,
  deleteProgress,
}) => {
  const intl = useIntl()

  const isBulk = Array.isArray(deletingId)
  const count = isBulk ? deletingId.length : 1

  return (
    <Modal
      isOpen={isOpen}
      title="Confirm Delete"
      onClose={onClose}
      bottomBar={
        <div className="flex justify-end gap3">
          <Button variation="tertiary" onClick={onClose} disabled={deleting}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button variation="danger" onClick={onConfirm} isLoading={deleting}>
            Delete
          </Button>
        </div>
      }
    >
      <div className="pa4">
        <p className="f5">
          {isBulk
            ? `Are you sure you want to delete ${count} record(s)?`
            : intl.formatMessage(messages.confirmDelete)}
        </p>
        {!isBulk && deletingId && (
          <p className="f7 c-muted-2 mt2 mb0">ID: {deletingId}</p>
        )}
        {isBulk && deleting && deleteProgress && deleteProgress?.total > 0 && (
          <div className="mt4">
            <p className="f6 c-muted-1">
              Deleting... {deleteProgress?.current} / {deleteProgress?.total}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
