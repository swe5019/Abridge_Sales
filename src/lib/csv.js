// Minimal CSV/TSV parser with quoted-field support. Detects the delimiter
// (tab if the header contains one, otherwise comma) so users can paste straight
// from a spreadsheet. Returns an array of row objects keyed by the header
// (lower-cased, trimmed).

function splitLine(line, delim) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === delim) {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

export function parseDelimited(text) {
  const lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((l) => l.trim() !== '')
  if (lines.length < 2) return { rows: [], headers: [] }

  const delim = lines[0].includes('\t') ? '\t' : ','
  const headers = splitLine(lines[0], delim).map((h) => h.toLowerCase().trim())
  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line, delim)
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = (cells[i] ?? '').trim()
    })
    return obj
  })
  return { rows, headers }
}
