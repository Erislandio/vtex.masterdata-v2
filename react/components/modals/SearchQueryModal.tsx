import React, { useEffect, useState } from 'react'
import { Button, Dropdown, Input, Modal, Textarea } from 'vtex.styleguide'

interface SearchQueryModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (where: string) => void
  initialWhere: string
  fields: string[]
}

const OPERATORS = [
  { value: '=', label: 'Equals (=)' },
  { value: '<>', label: 'Not Equals (<>)' },
  { value: '>', label: 'Greater Than (>)' },
  { value: '<', label: 'Less Than (<)' },
  { value: 'between', label: 'Between' },
  { value: 'is null', label: 'Is Null' },
  { value: 'is not null', label: 'Is Not Null' },
  { value: 'contains', label: 'Contains (*val*)' },
]

interface Rule {
  id: string
  field: string
  operator: string
  value1: string
  value2: string
}

export const SearchQueryModal: React.FC<SearchQueryModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialWhere,
  fields,
}) => {
  const [mode, setMode] = useState<'visual' | 'advanced'>('visual')
  const [rules, setRules] = useState<Rule[]>([])
  const [rawWhere, setRawWhere] = useState('')

  // Reset/sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialWhere) {
        // If there's an initial where, it might be too complex to parse into visual rules reliably.
        // We start in advanced mode with the raw string.
        setMode('advanced')
        setRawWhere(initialWhere)
        setRules([])
      } else {
        setMode('visual')
        setRawWhere('')
        setRules([
          {
            id: Date.now().toString(),
            field: fields[0] || '',
            operator: '=',
            value1: '',
            value2: '',
          },
        ])
      }
    }
  }, [isOpen, initialWhere, fields])

  const buildQueryFromRules = (currentRules: Rule[]) => {
    const validRules = currentRules.filter(r => {
      if (r.operator === 'is null' || r.operator === 'is not null')
        return r.field !== ''
      if (r.operator === 'between')
        return r.field !== '' && r.value1 !== '' && r.value2 !== ''
      return r.field !== '' && r.value1 !== ''
    })

    if (validRules.length === 0) return ''

    const ruleStrings = validRules.map(r => {
      switch (r.operator) {
        case 'is null':
          return `${r.field} is null`
        case 'is not null':
          return `${r.field} is not null`
        case 'between':
          return `${r.field} between ${r.value1} AND ${r.value2}`
        case 'contains':
          return `${r.field}=*${r.value1}*`
        default:
          return `${r.field}${r.operator}${r.value1}`
      }
    })

    return ruleStrings.join(' AND ')
  }

  const handleModeSwitch = (newMode: 'visual' | 'advanced') => {
    if (newMode === 'advanced') {
      setRawWhere(buildQueryFromRules(rules))
    } else {
      // Switching back to visual will discard raw text changes.
      // We start fresh visual state, or we could keep old rules.
      // Let's keep old rules, but they won't reflect whatever was typed in raw mode.
    }
    setMode(newMode)
  }

  const handleApply = () => {
    const finalWhere = mode === 'visual' ? buildQueryFromRules(rules) : rawWhere
    onApply(finalWhere)
    onClose()
  }

  const addRule = () => {
    setRules([
      ...rules,
      {
        id: Date.now().toString(),
        field: fields[0] || '',
        operator: '=',
        value1: '',
        value2: '',
      },
    ])
  }

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id))
  }

  const updateRule = (id: string, updates: Partial<Rule>) => {
    setRules(rules.map(r => (r.id === id ? { ...r, ...updates } : r)))
  }

  const fieldOptions = fields.map(f => ({ value: f, label: f }))

  return (
    <Modal
      isOpen={isOpen}
      title="Advanced Search"
      onClose={onClose}
      bottomBar={
        <div className="flex justify-end gap3">
          <Button variation="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variation="primary" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      }
    >
      <div className="pa4">
        <div className="flex mb5 gap2">
          <Button
            size="small"
            variation={mode === 'visual' ? 'primary' : 'tertiary'}
            onClick={() => handleModeSwitch('visual')}
          >
            Visual Builder
          </Button>
          <Button
            size="small"
            variation={mode === 'advanced' ? 'primary' : 'tertiary'}
            onClick={() => handleModeSwitch('advanced')}
          >
            Raw Query
          </Button>
        </div>

        {mode === 'visual' ? (
          <div className="flex flex-column gap4">
            {rules.length === 0 && (
              <p className="c-muted-2 f6">
                No rules defined. Click "Add Rule" to start filtering.
              </p>
            )}

            {rules.map(rule => (
              <div
                key={rule.id}
                className="flex flex-wrap items-end gap3 pb3 bb b--muted-5"
              >
                <div style={{ width: 200 }}>
                  <Dropdown
                    label="Field"
                    options={fieldOptions}
                    value={rule.field}
                    onChange={(e: any) =>
                      updateRule(rule.id, { field: e.target.value })
                    }
                  />
                </div>
                <div style={{ width: 160 }}>
                  <Dropdown
                    label="Operator"
                    options={OPERATORS}
                    value={rule.operator}
                    onChange={(e: any) =>
                      updateRule(rule.id, { operator: e.target.value })
                    }
                  />
                </div>

                {rule.operator !== 'is null' &&
                  rule.operator !== 'is not null' && (
                    <div className="flex-auto flex gap2">
                      <div className="flex-auto">
                        <Input
                          label={rule.operator === 'between' ? 'From' : 'Value'}
                          value={rule.value1}
                          onChange={(e: any) =>
                            updateRule(rule.id, { value1: e.target.value })
                          }
                        />
                      </div>
                      {rule.operator === 'between' && (
                        <div className="flex-auto">
                          <Input
                            label="To"
                            value={rule.value2}
                            onChange={(e: any) =>
                              updateRule(rule.id, { value2: e.target.value })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}

                <div>
                  <Button
                    variation="danger-tertiary"
                    onClick={() => removeRule(rule.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt2">
              <Button variation="secondary" size="small" onClick={addRule}>
                + Add Rule
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="f6 c-muted-2 mb3">
              Type your raw <code>_where</code> Master Data query here. You can
              use <code>OR</code>, parentheses, and complex expressions.
            </p>
            <Textarea
              value={rawWhere}
              onChange={(e: any) => setRawWhere(e.target.value)}
              style={{ minHeight: 150, fontFamily: 'monospace' }}
              placeholder="(age > 18 AND status = *active*) OR createdIn is null"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
