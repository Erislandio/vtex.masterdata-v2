import React from 'react'

interface JsonViewerProps {
  data: any
  level?: number
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, level = 0 }) => {
  if (data === null) {
    return <span className="c-muted-2">null</span>
  }

  if (typeof data === 'boolean') {
    return (
      <span className={data ? 'c-success' : 'c-danger'}>
        {data ? 'true' : 'false'}
      </span>
    )
  }

  if (typeof data === 'number') {
    return <span className="c-action-primary">{data}</span>
  }

  if (typeof data === 'string') {
    return <span className="c-on-action-secondary">"{data}"</span>
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="c-muted-2">[]</span>

    return (
      <div
        className="flex flex-column"
        style={{ paddingLeft: level > 0 ? 16 : 0 }}
      >
        <span className="c-muted-2">[</span>
        <div className="pl3 bl b--muted-4 ml1">
          {data.map((item, index) => (
            <div key={index} className="flex">
              <JsonViewer data={item} level={level + 1} />
              {index < data.length - 1 && <span className="c-muted-2">,</span>}
            </div>
          ))}
        </div>
        <span className="c-muted-2">]</span>
      </div>
    )
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data)
    if (keys.length === 0) return <span className="c-muted-2">{'{}'}</span>

    return (
      <div
        className="flex flex-column"
        style={{ paddingLeft: level > 0 ? 16 : 0 }}
      >
        <span className="c-muted-2">{'{'}</span>
        <div className="pl3 bl b--muted-4 ml1">
          {keys.map((key, index) => (
            <div key={key} className="flex flex-wrap">
              <span className="c-on-base fw5 mr2">"{key}":</span>
              <JsonViewer data={data[key]} level={level + 1} />
              {index < keys.length - 1 && <span className="c-muted-2">,</span>}
            </div>
          ))}
        </div>
        <span className="c-muted-2">{'}'}</span>
      </div>
    )
  }

  return <span>{String(data)}</span>
}
