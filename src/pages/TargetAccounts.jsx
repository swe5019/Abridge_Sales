import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import accounts from '../data/target-accounts.json'
import competitors from '../data/competitors.json'
import battlecards from '../data/battlecards.json'
import meta from '../data/meta.json'
import DataTable from '../components/DataTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import DataBadge from '../components/DataBadge.jsx'
import { uniqueValues, bandForBeds } from '../lib/filters'
import { computeFitScore, scoreTier, scoreTierLabel, FACTOR_KEYS } from '../lib/scoring'
import { mostlyIllustrative, ILLUSTRATIVE_BANNER } from '../lib/confidence'

const competitorName = (id) => competitors.find((c) => c.id === id)?.name || id
const battlecardFor = (id) => battlecards.find((b) => b.competitorId === id)

// Pre-compute derived fields once.
const enriched = accounts.map((a) => ({
  ...a,
  sizeBand: bandForBeds(a.beds, meta.sizeBands),
  fitScore: computeFitScore(a),
  vendorLabel: a.currentAmbientVendor ? competitorName(a.currentAmbientVendor) : 'None (greenfield)',
}))

const FIT_RANGES = [
  { label: 'Hot (75+)', test: (s) => s >= 75 },
  { label: 'Warm (55–74)', test: (s) => s >= 55 && s < 75 },
  { label: 'Cool (<55)', test: (s) => s < 55 },
]

export default function TargetAccounts() {
  const [filters, setFilters] = useState({
    search: '',
    region: '',
    ehr: '',
    sizeBand: '',
    vendor: '',
    fit: '',
  })
  const [selected, setSelected] = useState(null)

  const regions = useMemo(() => uniqueValues(enriched, 'region'), [])
  const ehrs = useMemo(() => uniqueValues(enriched, 'ehr'), [])
  const sizeBands = useMemo(() => meta.sizeBands.map((b) => b.label), [])
  const vendors = useMemo(() => uniqueValues(enriched, 'vendorLabel'), [])

  const rows = useMemo(() => {
    return enriched.filter((a) => {
      if (filters.search && !a.name.toLowerCase().includes(filters.search.toLowerCase()))
        return false
      if (filters.region && a.region !== filters.region) return false
      if (filters.ehr && a.ehr !== filters.ehr) return false
      if (filters.sizeBand && a.sizeBand !== filters.sizeBand) return false
      if (filters.vendor && a.vendorLabel !== filters.vendor) return false
      if (filters.fit) {
        const range = FIT_RANGES.find((r) => r.label === filters.fit)
        if (range && !range.test(a.fitScore)) return false
      }
      return true
    })
  }, [filters])

  const fields = [
    { key: 'search', label: 'Search account', type: 'search', placeholder: 'Health system…' },
    { key: 'region', label: 'Region', type: 'select', options: regions },
    { key: 'ehr', label: 'EHR', type: 'select', options: ehrs },
    { key: 'sizeBand', label: 'Size', type: 'select', options: sizeBands },
    { key: 'vendor', label: 'Current ambient vendor', type: 'select', options: vendors },
    { key: 'fit', label: 'Fit', type: 'select', options: FIT_RANGES.map((r) => r.label) },
  ]

  const columns = [
    { key: 'name', label: 'Health System', accessor: (r) => r.name },
    { key: 'region', label: 'Region' },
    { key: 'state', label: 'State' },
    { key: 'beds', label: 'Beds', sortAccessor: (r) => r.beds, accessor: (r) => r.beds.toLocaleString() },
    { key: 'ehr', label: 'EHR' },
    {
      key: 'vendorLabel',
      label: 'Current Vendor',
      render: (r) =>
        r.currentAmbientVendor ? (
          <span className="badge cat">{r.vendorLabel}</span>
        ) : (
          <span className="muted">None (greenfield)</span>
        ),
    },
    {
      key: 'fitScore',
      label: 'Fit Score',
      sortAccessor: (r) => r.fitScore,
      render: (r) => <span className={`score ${scoreTier(r.fitScore)}`}>{r.fitScore}</span>,
    },
  ]

  function update(key, value) {
    setFilters((f) => ({ ...f, [key]: value }))
  }
  function reset() {
    setFilters({ search: '', region: '', ehr: '', sizeBand: '', vendor: '', fit: '' })
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Prospecting Tool</div>
        <h1>Target Accounts</h1>
        <p>
          Filter and rank health systems by fit. The fit score is computed from EHR fit,
          greenfield opportunity, account size, and regional priority — see{' '}
          <Link to="/methodology">Fit Scoring</Link>. Click a row for talking points and the
          right battlecard.
        </p>
      </div>

      {mostlyIllustrative(accounts) && <div className="banner warn">{ILLUSTRATIVE_BANNER}</div>}

      <FilterBar fields={fields} values={filters} onChange={update} onReset={reset} />
      <div className="result-count">
        Showing {rows.length} of {enriched.length} accounts
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        onRowClick={setSelected}
        initialSort={{ key: 'fitScore', dir: 'desc' }}
      />

      {selected && <AccountDetail account={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function AccountDetail({ account, onClose }) {
  const bc = account.currentAmbientVendor ? battlecardFor(account.currentAmbientVendor) : null
  return (
    <div className="card" style={{ marginTop: 22 }}>
      <div className="spread">
        <h2 style={{ marginBottom: 0 }}>
          {account.name} <DataBadge confidence={account.sourceConfidence} />
        </h2>
        <button className="btn" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="detail-grid" style={{ marginTop: 14 }}>
        <div>
          <dl className="kv">
            <dt>Region / State</dt>
            <dd>
              {account.region} · {account.state}
            </dd>
            <dt>Beds</dt>
            <dd>{account.beds.toLocaleString()} ({account.sizeBand})</dd>
            <dt>Physicians</dt>
            <dd>{account.physicianCount?.toLocaleString() || '—'}</dd>
            <dt>EHR</dt>
            <dd>{account.ehr}</dd>
            <dt>Current ambient vendor</dt>
            <dd>{account.vendorLabel}</dd>
          </dl>
          {account.notes && (
            <p style={{ marginTop: 14 }}>
              <strong>Intel:</strong> {account.notes}
            </p>
          )}
          <h3 style={{ marginTop: 16 }}>Suggested talking points</h3>
          <ul className="list-clean">
            {account.currentAmbientVendor ? (
              <li>
                Displacement play — they may already run{' '}
                <strong>{account.vendorLabel}</strong>. Lead with #1 KLAS note quality and a
                head-to-head pilot.
              </li>
            ) : (
              <li>
                Greenfield — no incumbent ambient vendor. Lead with clinician burnout / retention
                and the #1 KLAS ranking.
              </li>
            )}
            {account.ehr === 'Epic' ? (
              <li>Epic shop — emphasize deep, native Epic integration and clinician adoption.</li>
            ) : (
              <li>
                {account.ehr} shop — lead with the integration roadmap and security model for
                their EHR; bring relevant references.
              </li>
            )}
            <li>
              Scale: ~{account.physicianCount?.toLocaleString() || 'many'} physicians — model ROI
              on documentation time saved across the group.
            </li>
          </ul>
        </div>
        <div>
          <div className="card" style={{ background: 'var(--bg)' }}>
            <div className="eyebrow">Fit Score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 12px' }}>
              <span className={`score ${scoreTier(account.fitScore)}`} style={{ fontSize: 16 }}>
                {account.fitScore}
              </span>
              <strong>{scoreTierLabel(account.fitScore)}</strong>
            </div>
            <dl className="kv" style={{ gridTemplateColumns: '1fr auto' }}>
              {FACTOR_KEYS.map((k) => (
                <FactorRow key={k} label={meta.factorLabels[k]} value={account.fitFactors[k]} />
              ))}
            </dl>
          </div>
          {bc && (
            <p style={{ marginTop: 14 }}>
              <Link className="btn primary" to={`/battlecards/${bc.competitorId}`}>
                Open {account.vendorLabel} battlecard →
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function FactorRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}/5</dd>
    </>
  )
}
