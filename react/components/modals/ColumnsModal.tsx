import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Button, Modal, Toggle } from 'vtex.styleguide'

const messages = defineMessages({
  columnsModalTitle: { id: 'masterdatav2.records.columns-modal-title' },
  columnsEmpty: { id: 'masterdatav2.records.columns-empty' },
  cancelButton: { id: 'masterdatav2.records.cancel-button' },
  saveButton: { id: 'masterdatav2.records.save-button' },
})

interface ColumnsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  savingPrefs: boolean
  availableColumns: string[]
  selectedColumnsSet: Set<string>
  setSelectedColumnsSet: React.Dispatch<React.SetStateAction<Set<string>>>
}

export const ColumnsModal: React.FC<ColumnsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  savingPrefs,
  availableColumns,
  selectedColumnsSet,
  setSelectedColumnsSet,
}) => {
  const intl = useIntl()

  return (
    <Modal
      isOpen={isOpen}
      title={intl.formatMessage(messages.columnsModalTitle)}
      onClose={onClose}
      bottomBar={
        <div className="flex justify-end gap3">
          <Button variation="tertiary" onClick={onClose}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button variation="primary" onClick={onSave} isLoading={savingPrefs}>
            {intl.formatMessage(messages.saveButton)}
          </Button>
        </div>
      }
    >
      <div className="pa4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {availableColumns.length === 0 ? (
          <p className="c-muted-1">
            {intl.formatMessage(messages.columnsEmpty)}
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1rem',
            }}
          >
            {availableColumns.map(col => {
              const isChecked = selectedColumnsSet.has(col)
              return (
                <div key={col}>
                  <Toggle
                    checked={isChecked}
                    id={`col-${col}`}
                    label={col}
                    onChange={() => {
                      const newSet = new Set(selectedColumnsSet)
                      if (isChecked) {
                        newSet.delete(col)
                      } else {
                        newSet.add(col)
                      }
                      setSelectedColumnsSet(newSet)
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
