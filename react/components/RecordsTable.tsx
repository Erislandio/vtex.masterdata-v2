import React, { useState } from 'react'
import {
  Button,
  ButtonWithIcon,
  IconDelete,
  IconEdit,
  Table,
  Toggle,
} from 'vtex.styleguide'
import { ViewObjectModal } from './modals/ViewObjectModal'

const HIDDEN_KEYS = new Set(['_href', 'userId'])

interface RecordsTableProps {
  records: Record<string, any>[]
  total: number
  page: number
  pageSize: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  setPageSize: React.Dispatch<React.SetStateAction<number>>
  emptyStateLabel: string
  columnKeys: string[]
  onView: (record: Record<string, any>) => void
  onEdit: (record: Record<string, any>) => void
  onDelete: (id: string) => void
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  total,
  page,
  pageSize,
  setPage,
  setPageSize,
  emptyStateLabel,
  columnKeys,
  onView,
  onEdit,
  onDelete,
}) => {
  const [objectModal, setObjectModal] = useState<{
    isOpen: boolean
    title: string
    data: any
  }>({
    isOpen: false,
    title: '',
    data: null,
  })

  const displayKeys = columnKeys.filter(k => !HIDDEN_KEYS.has(k))

  const tableSchema = {
    properties: {
      ...displayKeys.reduce((acc: Record<string, any>, key: string) => {
        acc[key] = {
          title: key,
          width: key === 'id' ? 250 : 160,
          cellRenderer: ({ cellData }: any) => {
            if (cellData === null || cellData === undefined) {
              return <span className="c-muted-3">—</span>
            }
            if (typeof cellData === 'boolean') {
              return (
                <span className={cellData ? 'c-success' : 'c-muted-3'}>
                  <Toggle checked={cellData} />
                </span>
              )
            }
            if (typeof cellData === 'object') {
              return (
                <Button
                  variation="tertiary"
                  size="small"
                  onClick={() =>
                    setObjectModal({
                      isOpen: true,
                      title: key,
                      data: cellData,
                    })
                  }
                >
                  {Array.isArray(cellData) ? 'View Array' : 'View Object'}
                </Button>
              )
            }

            return (
              <span className="f6 truncate" title={String(cellData)}>
                {String(cellData)}
              </span>
            )
          },
        }

        return acc
      }, {}),
      _actions: {
        title: ' ',
        width: 140,
        cellRenderer: ({ rowData }: any) => (
          <div className="flex items-center gap2">
            <Button
              variation="tertiary"
              size="small"
              onClick={() => onView(rowData)}
            >
              View
            </Button>
            <ButtonWithIcon
              icon={<IconEdit />}
              variation="tertiary"
              size="small"
              onClick={() => onEdit(rowData)}
            />
            <ButtonWithIcon
              icon={<IconDelete />}
              variation="danger-tertiary"
              size="small"
              onClick={() => onDelete(rowData.id)}
            />
          </div>
        ),
      },
    },
  }

  return (
    <>
      <Table
        schema={tableSchema}
        items={records}
        emptyStateLabel={emptyStateLabel}
        pagination={{
          onNextClick: () => setPage(p => p + 1),
          onPrevClick: () => setPage(p => Math.max(1, p - 1)),
          currentItemFrom: (page - 1) * pageSize + 1,
          currentItemTo: Math.min(page * pageSize, total),
          onRowsChange: (e: any, value: string) => {
            setPageSize(Number(value))
            setPage(1)
          },
          textShowRows: 'Show rows',
          textOf: 'of',
          totalItems: total,
          rowsOptions: [20, 50, 100],
        }}
      />
      <ViewObjectModal
        isOpen={objectModal.isOpen}
        onClose={() => setObjectModal(prev => ({ ...prev, isOpen: false }))}
        title={objectModal.title}
        data={objectModal.data}
      />
    </>
  )
}
