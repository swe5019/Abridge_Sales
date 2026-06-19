import { useState, useMemo } from 'react'
import { sortRows } from '../lib/filters'

// Reusable sortable table.
// columns: [{ key, label, accessor?(row), render?(row), sortable?, sortAccessor?(row) }]
// rows: array of objects. onRowClick optional. initialSort: { key, dir }.
export default function DataTable({ columns, rows, onRowClick, initialSort }) {
  const [sort, setSort] = useState(initialSort || null)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col || col.sortable === false) return rows
    const accessor = col.sortAccessor || col.accessor || ((r) => r[col.key])
    return sortRows(rows, accessor, sort.dir)
  }, [rows, sort, columns])

  function toggleSort(col) {
    if (col.sortable === false) return
    setSort((prev) => {
      if (!prev || prev.key !== col.key) return { key: col.key, dir: 'asc' }
      if (prev.dir === 'asc') return { key: col.key, dir: 'desc' }
      return null
    })
  }

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sort && sort.key === col.key
              return (
                <th
                  key={col.key}
                  className={col.sortable === false ? 'no-sort' : ''}
                  onClick={() => toggleSort(col)}
                >
                  {col.label}
                  {active && <span className="arrow">{sort.dir === 'asc' ? '▲' : '▼'}</span>}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty">
                No matching records.
              </td>
            </tr>
          )}
          {sorted.map((row, i) => (
            <tr
              key={row.id || i}
              className={onRowClick ? 'clickable' : ''}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : col.accessor ? col.accessor(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
