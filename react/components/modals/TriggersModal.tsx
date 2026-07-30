import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import {
  Alert,
  Button,
  ButtonWithIcon,
  Checkbox,
  IconDelete,
  IconEdit,
  Input,
  Modal,
} from 'vtex.styleguide'

const messages = defineMessages({
  triggersModalTitle: {
    id: 'masterdatav2.records.triggers-modal-title',
    defaultMessage: 'Triggers',
  },
  addTrigger: {
    id: 'masterdatav2.records.add-trigger',
    defaultMessage: 'Add Trigger',
  },
  editTrigger: {
    id: 'masterdatav2.records.edit-trigger',
    defaultMessage: 'Edit Trigger',
  },
  noTriggers: {
    id: 'masterdatav2.records.no-triggers',
    defaultMessage: 'No triggers found.',
  },
  cancelButton: { id: 'masterdatav2.records.cancel-button' },
  saveButton: { id: 'masterdatav2.records.save-button' },
})

interface TriggersModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSchema: any) => Promise<void>
  onDelete: (updatedSchema: any) => Promise<void>
  fullSchema: any
}

export const TriggersModal: React.FC<TriggersModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  fullSchema,
}) => {
  const intl = useIntl()

  const [editingTrigger, setEditingTrigger] = useState<any>(null)
  const [triggerJson, setTriggerJson] = useState(
    '{\n  "name": "",\n  "active": true,\n  "condition": "",\n  "action": {}\n}'
  )
  const [triggerEditMode, setTriggerEditMode] = useState<'fields' | 'json'>(
    'fields'
  )
  const [triggerActionJson, setTriggerActionJson] = useState('{}')
  const [triggerJsonError, setTriggerJsonError] = useState<string | null>(null)
  const [savingTrigger, setSavingTrigger] = useState(false)
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [testingTrigger, setTestingTrigger] = useState<string | null>(null)

  const handleClose = () => {
    setEditingTrigger(null)
    onClose()
  }

  const handleSaveTrigger = async () => {
    try {
      setTriggerJsonError(null)
      let parsedTrigger: any
      if (triggerEditMode === 'json') {
        parsedTrigger = JSON.parse(triggerJson)
      } else {
        parsedTrigger = { ...editingTrigger }
        parsedTrigger.action = JSON.parse(triggerActionJson)
      }

      if (!parsedTrigger.name) throw new Error('Trigger must have a name')

      setSavingTrigger(true)
      const updatedSchema = { ...fullSchema }
      const triggers = updatedSchema['v-triggers'] || []

      const existingIndex = triggers.findIndex(
        (t: any) => t.name === parsedTrigger.name
      )
      if (existingIndex >= 0) {
        triggers[existingIndex] = parsedTrigger
      } else {
        triggers.push(parsedTrigger)
      }

      updatedSchema['v-triggers'] = triggers

      await onSave(updatedSchema)
      setEditingTrigger(null)
    } catch (err) {
      setTriggerJsonError((err as any).message || 'Invalid JSON format')
    } finally {
      setSavingTrigger(false)
    }
  }

  const handleDeleteTrigger = async (triggerName: string) => {
    if (!window.confirm(`Delete trigger ${triggerName}?`)) return
    try {
      const updatedSchema = { ...fullSchema }
      updatedSchema['v-triggers'] = (updatedSchema['v-triggers'] || []).filter(
        (t: any) => t.name !== triggerName
      )
      await onDelete(updatedSchema)
    } catch {
      // Error handled by parent usually
    }
  }

  const handleTestTrigger = async (trigger: any) => {
    if (!trigger.action?.uri) {
      setTestResult({
        type: 'error',
        message:
          'Trigger action is missing a URI. Only HTTP triggers can be tested from here.',
      })
      return
    }

    try {
      setTestingTrigger(trigger.name)
      setTestResult(null)

      const res = await fetch(trigger.action.uri, {
        method: trigger.action.method || 'POST',
        headers: trigger.action.headers || {
          'Content-Type': 'application/json',
        },
        body: trigger.action.body
          ? JSON.stringify(trigger.action.body)
          : undefined,
      })

      if (!res.ok) {
        throw new Error(
          `Request failed with status ${res.status}: ${res.statusText}`
        )
      }

      setTestResult({
        type: 'success',
        message: `Test successful! (${res.status} ${res.statusText})`,
      })
    } catch (err) {
      setTestResult({
        type: 'error',
        message: `Test failed: ${(err as any).message}. (Note: This might be due to CORS if the URL is external).`,
      })
    } finally {
      setTestingTrigger(null)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={intl.formatMessage(messages.triggersModalTitle)}
      onClose={handleClose}
      bottomBar={
        editingTrigger ? (
          <div className="flex justify-end gap3">
            <Button
              variation="tertiary"
              onClick={() => setEditingTrigger(null)}
            >
              {intl.formatMessage(messages.cancelButton)}
            </Button>
            <Button
              variation="primary"
              onClick={handleSaveTrigger}
              isLoading={savingTrigger}
            >
              {intl.formatMessage(messages.saveButton)}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button variation="primary" onClick={handleClose}>
              Close
            </Button>
          </div>
        )
      }
    >
      <div className="pa4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {editingTrigger ? (
          <div>
            <div className="flex justify-between items-center mb4">
              <h3 className="f5 ma0">
                {editingTrigger.name
                  ? intl.formatMessage(messages.editTrigger)
                  : intl.formatMessage(messages.addTrigger)}
              </h3>
              <div className="flex gap3">
                <Button
                  size="small"
                  variation={
                    triggerEditMode === 'fields' ? 'primary' : 'tertiary'
                  }
                  onClick={() => {
                    if (triggerEditMode === 'json') {
                      try {
                        const obj = JSON.parse(triggerJson)
                        setEditingTrigger(obj)
                        setTriggerActionJson(
                          JSON.stringify(obj.action || {}, null, 2)
                        )
                      } catch {
                        setTriggerJsonError(
                          'Fix JSON syntax before switching mode'
                        )
                        return
                      }
                    }
                    setTriggerJsonError(null)
                    setTriggerEditMode('fields')
                  }}
                >
                  Fields
                </Button>
                <Button
                  size="small"
                  variation={
                    triggerEditMode === 'json' ? 'primary' : 'tertiary'
                  }
                  onClick={() => {
                    if (triggerEditMode === 'fields') {
                      try {
                        const act = JSON.parse(triggerActionJson)
                        setTriggerJson(
                          JSON.stringify(
                            { ...editingTrigger, action: act },
                            null,
                            2
                          )
                        )
                      } catch {
                        setTriggerJsonError(
                          'Fix Action JSON syntax before switching mode'
                        )
                        return
                      }
                    }
                    setTriggerJsonError(null)
                    setTriggerEditMode('json')
                  }}
                >
                  JSON
                </Button>
              </div>
            </div>

            {triggerJsonError && (
              <div className="mb4">
                <Alert type="error" onClose={() => setTriggerJsonError(null)}>
                  {triggerJsonError}
                </Alert>
              </div>
            )}

            {triggerEditMode === 'json' ? (
              <div>
                <label className="db mb2 f6 fw5">Trigger JSON</label>
                <textarea
                  className="w-100 pa3 ba b--muted-4 br2 f6"
                  value={triggerJson}
                  onChange={e => {
                    setTriggerJson(e.target.value)
                    setTriggerJsonError(null)
                  }}
                  style={{
                    fontFamily: 'monospace',
                    resize: 'vertical',
                    minHeight: 300,
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-column gap4">
                <Input
                  label="Name"
                  value={editingTrigger.name || ''}
                  onChange={(e: any) =>
                    setEditingTrigger({
                      ...editingTrigger,
                      name: e.target.value,
                    })
                  }
                />
                <Checkbox
                  id="trigger-active"
                  name="trigger-active"
                  value="active"
                  label="Active"
                  checked={editingTrigger.active !== false}
                  onChange={(e: any) =>
                    setEditingTrigger({
                      ...editingTrigger,
                      active: e.target.checked,
                    })
                  }
                />
                <Input
                  label="Condition"
                  value={editingTrigger.condition || ''}
                  onChange={(e: any) =>
                    setEditingTrigger({
                      ...editingTrigger,
                      condition: e.target.value,
                    })
                  }
                  helpText="Example: status=window-to-cancel"
                />
                <div>
                  <label className="db mb2 f6 fw5">Action (JSON)</label>
                  <textarea
                    className="w-100 pa3 ba b--muted-4 br2 f6"
                    value={triggerActionJson}
                    onChange={e => {
                      setTriggerActionJson(e.target.value)
                      setTriggerJsonError(null)
                    }}
                    style={{
                      fontFamily: 'monospace',
                      resize: 'vertical',
                      minHeight: 150,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {testResult && (
              <div className="mb4">
                <Alert
                  type={testResult.type}
                  onClose={() => setTestResult(null)}
                >
                  {testResult.message}
                </Alert>
              </div>
            )}

            <div className="flex justify-end mb4">
              <Button
                variation="primary"
                size="small"
                onClick={() => {
                  setTriggerJson(
                    '{\n  "name": "",\n  "active": true,\n  "condition": "",\n  "action": {}\n}'
                  )
                  setEditingTrigger({
                    name: '',
                    active: true,
                    condition: '',
                    action: {},
                  })
                  setTriggerActionJson('{}')
                  setTriggerEditMode('fields')
                  setTestResult(null)
                }}
              >
                + {intl.formatMessage(messages.addTrigger)}
              </Button>
            </div>

            {!fullSchema?.['v-triggers'] ||
            fullSchema['v-triggers'].length === 0 ? (
              <p className="c-muted-1 tc pv6">
                {intl.formatMessage(messages.noTriggers)}
              </p>
            ) : (
              <div className="flex flex-column gap4">
                {fullSchema['v-triggers'].map((t: any) => (
                  <div
                    key={t.name}
                    className="ba b--muted-4 br2 pa4 flex justify-between items-start"
                  >
                    <div>
                      <p className="f5 fw6 ma0 mb2">{t.name}</p>
                      <p className="f7 c-muted-1 ma0 mb1">
                        Active:{' '}
                        <span
                          className={
                            t.active ? 'c-success fw5' : 'c-danger fw5'
                          }
                        >
                          {String(t.active)}
                        </span>
                      </p>
                      {t.condition && (
                        <p className="f7 c-muted-1 ma0">
                          Condition:{' '}
                          <code className="bg-muted-5 pa1 br2">
                            {t.condition}
                          </code>
                        </p>
                      )}
                    </div>
                    <div className="flex gap3">
                      <Button
                        variation="secondary"
                        size="small"
                        isLoading={testingTrigger === t.name}
                        onClick={() => handleTestTrigger(t)}
                      >
                        Test
                      </Button>
                      <ButtonWithIcon
                        icon={<IconEdit />}
                        variation="tertiary"
                        size="small"
                        onClick={() => {
                          setTriggerJson(JSON.stringify(t, null, 2))
                          setEditingTrigger(t)
                          setTriggerActionJson(
                            JSON.stringify(t.action || {}, null, 2)
                          )
                          setTriggerEditMode('fields')
                        }}
                      />
                      <ButtonWithIcon
                        icon={<IconDelete />}
                        variation="danger-tertiary"
                        size="small"
                        onClick={() => handleDeleteTrigger(t.name)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
