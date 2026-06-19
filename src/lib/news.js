import newsData from '../data/news.json'

// news.json is kept fresh by a scheduled GitHub Action (scripts/fetch-news.mjs)
// that pulls real headlines from public RSS feeds and redeploys the site. The
// app just reads the bundled file — no runtime fetch, so it works offline and
// has no CORS/secret concerns.

function normalize(item) {
  return {
    id: item.id || item.url || item.title,
    date: item.date || '',
    title: item.title || 'Untitled',
    source: item.source || 'Unknown source',
    url: item.url || '#',
    summary: item.summary || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
  }
}

function dedupeAndSort(items) {
  const seen = new Set()
  const out = []
  for (const raw of items) {
    const item = normalize(raw)
    const key = (item.url && item.url !== '#' ? item.url : item.title).toLowerCase().trim()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  out.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return out
}

export const curated = dedupeAndSort(newsData)

// Most recent headline date — shown in the UI as the "last refreshed" signal.
export const latestDate = curated.length ? curated[0].date : ''
