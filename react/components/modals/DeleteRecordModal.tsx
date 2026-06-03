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
  deletingId: string | null
}

export const DeleteRecordModal: React.FC<DeleteRecordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  deleting,
  deletingId,
}) => {
  const intl = useIntl()

  return (
    <Modal
      isOpen={isOpen}
      title="Confirm Delete"
      onClose={onClose}
      bottomBar={
        <div className="flex justify-end gap3">
          <Button variation="tertiary" onClick={onClose}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button variation="danger" onClick={onConfirm} isLoading={deleting}>
            Delete
          </Button>
        </div>
      }
    >
      <div className="pa4">
        <p className="f5">{intl.formatMessage(messages.confirmDelete)}</p>
        {deletingId && <p className="f7 c-muted-2 mt2 mb0">ID: {deletingId}</p>}
      </div>
    </Modal>
  )
}
