// Deal radar: scans public news for competitor ADOPTION / PARTNERSHIP
// announcements and writes them to src/data/client-leads.json as *candidate*
// rows for a human to verify before promoting into competitor-clients.json.
//
// Like the news job, this runs in GitHub Actions (open network), not the
// browser. Reuses the RSS parsing from fetch-news.mjs.
//
// Run:  node scripts/fetch-client-leads.mjs   (npm run update-leads)

import { writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { parseFeed } from './fetch-news.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'src', 'data', 'client-leads.json')
const COMPETITORS = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'competitors.json'), 'utf8')
)
const MAX_ITEMS = 50

const gnews = (q) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`

// Search terms per competitor — names that read clearly in a news query.
const QUERY_NAME = {
  'nuance-dax': 'Nuance DAX OR "DAX Copilot"',
  ambience: '"Ambience Healthcare"',
  suki: '"Suki AI" OR "Suki Assistant"',
  nabla: 'Nabla Copilot OR "Nabla" ambient',
  deepscribe: 'DeepScribe',
  'augmedix-commure': 'Augmedix OR Commure',
  'epic-native': 'Epic ambient documentation',
  freed: '"Freed AI" ambient scribe',
}

// An item is a candidate "deal" only if it pairs an adoption verb with a
// healthcare-provider context.
const ADOPTION =
  /(deploys?|selects?|roll(?:s|ing)? out|rolled out|partners?|partnership|adopts?|implements?|goes? live|go-live|expands?|chooses?|signs?|contract|launch(?:es|ed)?|brings? on)/i
const PROVIDER =
  /(health|hospital|clinic|medical center|medical group|care|physician|provider|system|university|children'?s)/i

const FETCH_TIMEOUT_MS = 15000

async function fetchFeed(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (AbridgeSalesDealRadar)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return parseFeed(await res.text())
  } catch (e) {
    console.warn(`Skipping query (${url}): ${e.message}`)
    return []
  } finally {
    clearTimeout(t)
  }
}

function hashId(s) {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h.toString(36)
}

async function main() {
  const leads = []
  const seen = new Set()

  for (const comp of COMPETITORS) {
    const term = QUERY_NAME[comp.id]
    if (!term) continue
    const query = `${term} (deploy OR selects OR partnership OR "rolls out" OR adopts OR "goes live" OR implements) (health OR hospital OR clinic OR medical)`
    const items = await fetchFeed(gnews(query))
    for (const it of items) {
      const text = `${it.title} ${it.summary}`
      if (!ADOPTION.test(text) || !PROVIDER.test(text)) continue
      const key = it.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      if (seen.has(key)) continue
      seen.add(key)
      leads.push({
        id: `lead-${it.date}-${hashId(it.title)}`,
        date: it.date,
        competitorId: comp.id,
        competitorName: comp.name,
        title: it.title,
        source: it.source,
        url: it.url,
        summary: it.summary,
        status: 'unverified',
      })
    }
  }

  leads.sort((a, b) => b.date.localeCompare(a.date))
  const finalLeads = leads.slice(0, MAX_ITEMS)

  if (finalLeads.length === 0) {
    console.warn('No deal leads gathered — keeping existing client-leads.json unchanged.')
    return
  }

  const after = JSON.stringify(finalLeads, null, 2) + '\n'
  let before = ''
  try {
    before = readFileSync(OUT, 'utf8')
  } catch {
    /* file may not exist yet */
  }
  if (before.trim() === after.trim()) {
    console.log('client-leads.json already up to date.')
    return
  }
  writeFileSync(OUT, after)
  console.log(`Wrote ${finalLeads.length} candidate deal leads to client-leads.json.`)
}

main()
