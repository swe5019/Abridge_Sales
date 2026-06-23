import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import clients from '../data/competitor-clients.json'
import competitors from '../data/competitors.json'
import leads from '../data/client-leads.json'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import DataBadge from '../components/DataBadge.jsx'
import ClientImporter from '../components/ClientImporter.jsx'
import { uniqueValues } from '../lib/filters'
import { mostlyIllustrative, ILLUSTRATIVE_BANNER } from '../lib/confidence'

const competitorName = (id) => competitors.find((c) => c.id === id)?.name || id

const enriched = clients.map((c) => ({
  ...c,
  competitorName: competitorName(c.competitorId),
}))

export default function CompetitorClients() {
  const [filters, setFilters] = useState({ search: '', competitor: '', region: '', ehr: '', type: '' })
  const [showImporter, setShowImporter] = useState(false)

  const competitorOpts = useMemo(() => uniqueValues(enriched, 'competitorName'), [])
  const regions = useMemo(() => uniqueValues(enriched, 'region'), [])
  const ehrs = useMemo(() => uniqueValues(enriched, 'ehr'), [])
  const types = useMemo(() => uniqueValues(enriched, 'relationshipType'), [])

  const rows = useMemo(() => {
    return enriched.filter((c) => {
      if (filters.search && !c.healthSystem.toLowerCase().includes(filters.search.toLowerCase()))
        return false
      if (filters.competitor && c.competitorName !== filters.competitor) return false
      if (filters.region && c.region !== filters.region) return false
      if (filters.ehr && c.ehr !== filters.ehr) return false
      if (filters.type && c.relationshipType !== filters.type) return false
      return true
    })
  }, [filters])

  const fields = [
    { key: 'search', label: 'Search health system', type: 'search', placeholder: 'Name…' },
    { key: 'competitor', label: 'Competitor', type: 'select', options: competitorOpts },
    { key: 'region', label: 'Region', type: 'select', options: regions },
    { key: 'ehr', label: 'EHR', type: 'select', options: ehrs },
    { key: 'type', label: 'Relationship', type: 'select', options: types },
  ]

  const columns = [
    { key: 'healthSystem', label: 'Health System' },
    {
      key: 'competitorName',
      label: 'Uses',
      render: (r) => (
        <Link to={`/battlecards/${r.competitorId}`} className="badge cat" style={{ textDecoration: 'none' }}>
          {r.competitorName}
        </Link>
      ),
    },
    { key: 'ehr', label: 'EHR' },
    { key: 'region', label: 'Region' },
    {
      key: 'relationshipType',
      label: 'Relationship',
      render: (r) => <span className="badge tag" style={{ textTransform: 'capitalize' }}>{r.relationshipType}</span>,
    },
    { key: 'sourceConfidence', label: 'Source', sortable: false, render: (r) => <DataBadge confidence={r.sourceConfidence} /> },
  ]

  function update(key, value) {
    setFilters((f) => ({ ...f, [key]: value }))
  }
  function reset() {
    setFilters({ search: '', competitor: '', region: '', ehr: '', type: '' })
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Displacement Intel</div>
        <h1>Competitor Clients</h1>
        <p>
          Who runs which competitor's product — a map of displacement and expansion
          opportunities. Filter by competitor to build a target list, then open the matching
          battlecard.
        </p>
      </div>

      {mostlyIllustrative(clients) && (
        <div className="banner warn">
          {ILLUSTRATIVE_BANNER} Health-system ↔ vendor pairings are sample data — confirm against
          public announcements or verified deal intel before acting.
        </div>
      )}

      <div className="spread" style={{ marginBottom: 12 }}>
        <div className="result-count" style={{ margin: 0 }}>
          Showing {rows.length} of {enriched.length} relationships
        </div>
        <button className="btn primary" onClick={() => setShowImporter((s) => !s)}>
          {showImporter ? 'Hide bulk add' : '+ Bulk add clients'}
        </button>
      </div>

      {showImporter && <ClientImporter onClose={() => setShowImporter(false)} />}

      <FilterBar fields={fields} values={filters} onChange={update} onReset={reset} />
      <DataTable columns={columns} rows={rows} initialSort={{ key: 'competitorName', dir: 'asc' }} />

      <DealRadar />
    </div>
  )
}

// Auto-surfaced candidate deals from the news/RSS deal radar (unverified).
function DealRadar() {
  const [competitor, setCompetitor] = useState('')
  const compOpts = useMemo(
    () => Array.from(new Set(leads.map((l) => l.competitorName))).sort(),
    []
  )
  const shown = competitor ? leads.filter((l) => l.competitorName === competitor) : leads

  return (
    <div className="section" style={{ marginTop: 34 }}>
      <div className="spread">
        <h2 style={{ marginBottom: 0 }}>Deal radar — candidate deals</h2>
        {compOpts.length > 0 && (
          <select
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--line)' }}
          >
            <option value="">All competitors</option>
            {compOpts.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
      </div>
      <div className="banner info" style={{ marginTop: 10 }}>
        Auto-surfaced from public news — <strong>unverified</strong> adoption / partnership
        mentions. Confirm each before promoting it into the table above (use “Bulk add clients”).
        Refreshes automatically on a schedule.
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          No candidate deals yet. The deal radar runs on a schedule (or on demand via the Actions
          tab) and will list competitor adoption announcements here as it finds them.
        </div>
      ) : (
        shown.map((l) => (
          <article className="news-item" key={l.id}>
            <div className="meta">
              <span>{l.date}</span>
              <span>·</span>
              <span>{l.source}</span>
              <Link to={`/battlecards/${l.competitorId}`} className="badge cat">
                {l.competitorName}
              </Link>
              <span className="badge illustrative">◐ Unverified</span>
            </div>
            <h3 style={{ fontSize: 15 }}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.title}
              </a>
            </h3>
            {l.summary && <p>{l.summary}</p>}
          </article>
        ))
      )}
    </div>
  )
}
