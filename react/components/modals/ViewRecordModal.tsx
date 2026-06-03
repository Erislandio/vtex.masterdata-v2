import React from 'react'
import { Button, Modal } from 'vtex.styleguide'
import { JsonViewer } from '../JsonViewer'

interface ViewRecordModalProps {
  isOpen: boolean
  onClose: () => void
  viewingRecord: Record<string, any> | null
  viewMode: 'fields' | 'json'
  setViewMode: (mode: 'fields' | 'json') => void
}

export const ViewRecordModal: React.FC<ViewRecordModalProps> = ({
  isOpen,
  onClose,
  viewingRecord,
  viewMode,
  setViewMode,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title={`View Record: ${viewingRecord?.id ?? ''}`}
      onClose={onClose}
      bottomBar={
        <div className="flex justify-end">
          <Button variation="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="pa4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div className="flex gap3 mb5">
          <Button
            size="small"
            variation={viewMode === 'fields' ? 'primary' : 'tertiary'}
            onClick={() => setViewMode('fields')}
          >
            Fields
          </Button>
          <Button
            size="small"
            variation={viewMode === 'json' ? 'primary' : 'tertiary'}
            onClick={() => setViewMode('json')}
          >
            JSON
          </Button>
        </div>

        {viewMode === 'fields' && viewingRecord && (
          <div className="flex flex-column gap4">
            {Object.entries(viewingRecord).map(([key, value]) => {
              if (key === '_href') return null
              return (
                <div key={key} className="bb b--muted-4 pb3">
                  <p className="f7 fw5 c-muted-2 ma0 mb1 ttu tracked">{key}</p>
                  <div
                    className="f6 c-on-base word-break"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {typeof value === 'object' && value !== null ? (
                      <div className="pa3 bg-muted-5 br2 overflow-x-auto">
                        <JsonViewer data={value} />
                      </div>
                    ) : (
                      String(value)
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {viewMode === 'json' && viewingRecord && (
          <div className="pa4 bg-muted-5 br2 overflow-x-auto f6">
            <JsonViewer
              data={Object.fromEntries(
                Object.entries(viewingRecord).filter(([k]) => k !== '_href')
              )}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
