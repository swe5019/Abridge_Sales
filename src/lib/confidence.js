// Helpers around the sourceConfidence field that every data record carries.

export function isIllustrative(record) {
  return record?.sourceConfidence === 'illustrative'
}

// True when illustrative records dominate a dataset — drives the page banner.
export function mostlyIllustrative(rows) {
  if (!rows || rows.length === 0) return false
  const n = rows.filter(isIllustrative).length
  return n / rows.length >= 0.5
}

export const ILLUSTRATIVE_BANNER =
  'Illustrative sample data — replace with verified intel before relying on it in a deal. Edit the JSON files in src/data/ to update.'
