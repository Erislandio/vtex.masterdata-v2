import React from 'react'
import { Button, Modal } from 'vtex.styleguide'

interface DeleteAllModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  deleting: boolean
  total: number
}

export const DeleteAllModal: React.FC<DeleteAllModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  deleting,
  total,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title="Confirm Delete All"
      onClose={onClose}
      bottomBar={
        <div className="flex justify-end gap3">
          <Button variation="tertiary" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variation="danger" onClick={onConfirm} isLoading={deleting}>
            Delete All
          </Button>
        </div>
      }
    >
      <div className="pa4">
        <p className="f5 c-danger fw5">
          WARNING: You are about to delete ALL {total} records.
        </p>
        <p className="f6 c-muted-1">
          This action is irreversible. All records matching the current filter
          will be permanently removed. Are you absolutely sure you want to
          proceed?
        </p>
      </div>
    </Modal>
  )
}
