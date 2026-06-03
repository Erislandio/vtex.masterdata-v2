import React from 'react'
import { Button, Modal } from 'vtex.styleguide'
import { JsonViewer } from '../JsonViewer'

interface ViewObjectModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: any
}

export const ViewObjectModal: React.FC<ViewObjectModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={`Viewing: ${title}`}
      onClose={onClose}
      bottomBar={
        <div className="flex justify-end">
          <Button variation="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div
        className="pa4 bg-muted-5 br2 f6 overflow-x-auto"
        style={{ maxHeight: '60vh' }}
      >
        <JsonViewer data={data} />
      </div>
    </Modal>
  )
}
