import React, { useEffect, useState } from 'react'
import { Alert, Button, Input, Modal, Textarea, Toggle } from 'vtex.styleguide'

interface EditRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  saving: boolean
  editingRecord: Record<string, any> | null
  fieldsJson: string
  setFieldsJson: (json: string) => void
  jsonError: string | null
  setJsonError: (error: string | null) => void
  fullSchema?: any
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  saving,
  editingRecord,
  fieldsJson,
  setFieldsJson,
  jsonError,
  setJsonError,
  fullSchema,
}) => {
  const [mode, setMode] = useState<'input' | 'json'>('input')

  useEffect(() => {
    if (isOpen) {
      setMode('input')
    }
  }, [isOpen])

  const handleModeChange = (newMode: 'input' | 'json') => {
    if (newMode === 'input') {
      try {
        JSON.parse(fieldsJson)
        setJsonError(null)
        setMode('input')
      } catch (e) {
        setJsonError('Cannot switch to Input mode: Invalid JSON')
      }
    } else {
      setMode('json')
    }
  }

  const renderInputs = () => {
    let currentData: Record<string, any> = {}
    try {
      currentData = JSON.parse(fieldsJson)
    } catch {
      return (
        <div className="c-danger">Invalid JSON. Please fix in JSON mode.</div>
      )
    }

    if (!fullSchema || !fullSchema.properties) {
      return (
        <div className="c-muted-2">
          Schema not loaded. Please use JSON mode.
        </div>
      )
    }

    const properties = fullSchema.properties
    // Exclude intrinsic fields like 'id' and 'accountId' from editing
    const fields = Object.keys(properties).filter(
      key => key !== 'id' && key !== 'accountId'
    )

    if (fields.length === 0) {
      return (
        <div className="c-muted-2">No editable properties found in schema.</div>
      )
    }

    return (
      <div className="flex flex-column" style={{ gap: '1rem' }}>
        {fields.map(key => {
          const property = properties[key]
          const type = property.type
          const value = currentData[key]

          const handleChange = (newVal: any) => {
            const newData = { ...currentData, [key]: newVal }
            setFieldsJson(JSON.stringify(newData, null, 2))
            setJsonError(null)
          }

          if (type === 'boolean') {
            return (
              <div key={key}>
                <Toggle
                  label={property.title || key}
                  checked={!!value}
                  onChange={(e: any) => handleChange(e.target.checked)}
                />
              </div>
            )
          }

          if (type === 'string') {
            return (
              <div key={key}>
                <Input
                  label={property.title || key}
                  value={value ?? ''}
                  onChange={(e: any) => handleChange(e.target.value)}
                />
              </div>
            )
          }

          // Any other type (object, array, number, integer, etc) gets a Textarea
          return (
            <div
              key={key}
              style={{
                fontFamily:
                  type === 'object' || type === 'array'
                    ? 'monospace'
                    : 'inherit',
              }}
            >
              <Textarea
                label={property.title || key}
                value={
                  typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : value || ''
                }
                onChange={(e: any) => {
                  let val = e.target.value
                  if (type === 'object' || type === 'array') {
                    try {
                      val = JSON.parse(e.target.value)
                    } catch {
                      // Fallback to string if parsing fails while typing
                    }
                  } else if (type === 'integer' || type === 'number') {
                    const num = Number(e.target.value)
                    if (!isNaN(num) && e.target.value !== '') {
                      val = num
                    }
                  }
                  handleChange(val)
                }}
                helpText={`Type is ${type}.${
                  type === 'object' || type === 'array'
                    ? ' Valid JSON required.'
                    : ''
                }`}
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      title={editingRecord ? `Edit: ${editingRecord.id ?? ''}` : 'Add Record'}
      onClose={onClose}
      bottomBar={
        <div className="flex justify-end gap3">
          <Button variation="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variation="primary" onClick={onSave} isLoading={saving}>
            Save
          </Button>
        </div>
      }
    >
      <div className="pa4">
        {jsonError && (
          <div className="mb4">
            <Alert type="error" onClose={() => setJsonError(null)}>
              {jsonError}
            </Alert>
          </div>
        )}

        <div className="flex mb5 gap2">
          <Button
            size="small"
            variation={mode === 'input' ? 'primary' : 'tertiary'}
            onClick={() => handleModeChange('input')}
          >
            Input
          </Button>
          <Button
            size="small"
            variation={mode === 'json' ? 'primary' : 'tertiary'}
            onClick={() => handleModeChange('json')}
          >
            JSON
          </Button>
        </div>

        {mode === 'input' ? (
          renderInputs()
        ) : (
          <div>
            <textarea
              className="w-100 pa3 ba b--muted-4 br2 f6"
              value={fieldsJson}
              onChange={e => {
                setFieldsJson(e.target.value)
                setJsonError(null)
              }}
              style={{
                fontFamily: 'monospace',
                resize: 'vertical',
                minHeight: 300,
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
