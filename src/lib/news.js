import curatedNews from '../data/news.json'
import meta from '../data/meta.json'

// News strategy: the curated news.json is always the source of truth and
// always renders. When meta.liveNews is true AND a feed URL is configured,
// we additionally try a client-side fetch and merge the results. ANY failure
// (network policy, CORS, bad payload) silently falls back to curated only.
//
// For a fully automated pipeline later, the right place to fetch is a
// build-time / CI script that writes news.json — not a runtime browser fetch.

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
    const key = (item.url && item.url !== '#' ? item.url : item.title)
      .toLowerCase()
      .trim()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  out.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  return out
}

export const curated = dedupeAndSort(curatedNews)

// Returns { items, live } — live indicates whether the live fetch contributed.
export async function loadNews() {
  const base = curatedNews
  if (!meta.liveNews || !meta.newsFeedUrl) {
    return { items: dedupeAndSort(base), live: false }
  }
  try {
    const res = await fetch(meta.newsFeedUrl, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    const liveItems = Array.isArray(data) ? data : data.items || []
    if (!Array.isArray(liveItems) || liveItems.length === 0) throw new Error('empty feed')
    return { items: dedupeAndSort([...liveItems, ...base]), live: true }
  } catch {
    // Silent fallback — curated list is always good enough.
    return { items: dedupeAndSort(base), live: false }
  }
}
