// Generic helpers for the filterable / sortable tables.

// Distinct, sorted list of values for a given key — used to build dropdowns.
export function uniqueValues(rows, key) {
  const set = new Set()
  for (const row of rows) {
    const v = row[key]
    if (v !== null && v !== undefined && v !== '') set.add(v)
  }
  return Array.from(set).sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true })
  )
}

// Stable sort by accessor. dir: 'asc' | 'desc'. Handles numbers and strings.
export function sortRows(rows, accessor, dir) {
  const sorted = [...rows].sort((a, b) => {
    const av = accessor(a)
    const bv = accessor(b)
    if (typeof av === 'number' && typeof bv === 'number') return av - bv
    return String(av ?? '').localeCompare(String(bv ?? ''), undefined, {
      numeric: true,
    })
  })
  return dir === 'desc' ? sorted.reverse() : sorted
}

export function bandForBeds(beds, sizeBands) {
  for (const band of sizeBands) {
    if (beds >= band.min) return band.label
  }
  return sizeBands.length ? sizeBands[sizeBands.length - 1].label : 'Unknown'
}
