import { useState, useMemo } from 'react'
import competitors from '../data/competitors.json'
import existingClients from '../data/competitor-clients.json'
import { parseDelimited } from '../lib/csv'
import DataBadge from './DataBadge.jsx'

// Build lookups so the "competitor" column accepts either an id or a name.
const compById = new Map(competitors.map((c) => [c.id, c]))
const compByName = new Map(competitors.map((c) => [c.name.toLowerCase(), c]))
const compByCompany = new Map(competitors.map((c) => [c.company.toLowerCase(), c]))

const VALID_RELATIONSHIPS = ['pilot', 'deployment', 'announced']

const TEMPLATE = [
  'healthSystem,competitor,ehr,region,relationshipType,publicSource',
  'Example Health,nuance-dax,Epic,Midwest,deployment,https://example.com/press-release',
  'Another System,Ambience AutoScribe,Epic,West,pilot,',
].join('\n')

function resolveCompetitor(raw) {
  const v = (raw || '').trim().toLowerCase()
  return compById.get(v) || compByName.get(v) || compByCompany.get(v) || null
}

function hashId(s) {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h.toString(36)
}

export default function ClientImporter({ onClose }) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const parsed = useMemo(() => {
    if (!text.trim()) return { valid: [], invalid: [] }
    const { rows } = parseDelimited(text)
    const valid = []
    const invalid = []
    for (const r of rows) {
      const comp = resolveCompetitor(r.competitor || r.competitorid)
      const healthSystem = r.healthsystem || r['health system'] || ''
      const problems = []
      if (!healthSystem) problems.push('missing healthSystem')
      if (!comp) problems.push(`unknown competitor "${r.competitor || r.competitorid || ''}"`)
      let rel = (r.relationshiptype || 'deployment').toLowerCase()
      if (!VALID_RELATIONSHIPS.includes(rel)) {
        problems.push(`relationship "${rel}" → defaulted to deployment`)
        rel = 'deployment'
      }
      const publicSource = r.publicsource || r['public source'] || ''
      if (problems.some((p) => p.startsWith('missing') || p.startsWith('unknown'))) {
        invalid.push({ raw: r, problems })
        continue
      }
      valid.push({
        record: {
          id: `cc-imp-${hashId(healthSystem + comp.id)}`,
          competitorId: comp.id,
          healthSystem,
          ehr: r.ehr || '',
          region: r.region || '',
          relationshipType: rel,
          publicSource,
          sourceConfidence: publicSource ? 'known-public' : 'illustrative',
        },
        competitorName: comp.name,
        warnings: problems,
      })
    }
    return { valid, invalid }
  }, [text])

  // Merge with existing clients, de-duping by healthSystem + competitorId.
  const merged = useMemo(() => {
    const byKey = new Map()
    for (const c of existingClients) byKey.set(`${c.healthSystem}|${c.competitorId}`, c)
    for (const v of parsed.valid)
      byKey.set(`${v.record.healthSystem}|${v.record.competitorId}`, v.record)
    return Array.from(byKey.values())
  }, [parsed])

  const mergedJson = useMemo(() => JSON.stringify(merged, null, 2) + '\n', [merged])
  const newCount = parsed.valid.length

  function copyJson() {
    navigator.clipboard?.writeText(mergedJson).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  function download() {
    const blob = new Blob([mergedJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'competitor-clients.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="spread">
        <h2 style={{ marginBottom: 0 }}>Bulk add competitor clients</h2>
        {onClose && (
          <button className="btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>
      <p className="muted" style={{ marginTop: 6 }}>
        Paste rows from a spreadsheet (CSV or tab-separated) with a header row. Columns:{' '}
        <code>healthSystem, competitor, ehr, region, relationshipType, publicSource</code>. The{' '}
        <code>competitor</code> can be an id (<code>nuance-dax</code>) or a name. Rows with a{' '}
        <code>publicSource</code> URL are marked <strong>✓ Public</strong>; otherwise{' '}
        <strong>◐ Sample</strong>.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button className="btn" onClick={() => setText(TEMPLATE)}>
          Load template
        </button>
        <button className="btn" onClick={() => setText('')}>
          Clear
        </button>
      </div>

      <textarea
        className="importer-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={TEMPLATE}
        spellCheck={false}
      />

      {text.trim() && (
        <>
          <div className="result-count" style={{ marginTop: 12 }}>
            {newCount} valid new/updated row(s)
            {parsed.invalid.length > 0 && `, ${parsed.invalid.length} skipped`}
          </div>

          {parsed.valid.length > 0 && (
            <div className="table-wrap" style={{ marginBottom: 12 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th className="no-sort">Health System</th>
                    <th className="no-sort">Competitor</th>
                    <th className="no-sort">EHR</th>
                    <th className="no-sort">Region</th>
                    <th className="no-sort">Relationship</th>
                    <th className="no-sort">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.valid.map((v) => (
                    <tr key={v.record.id}>
                      <td>{v.record.healthSystem}</td>
                      <td>
                        <span className="badge cat">{v.competitorName}</span>
                      </td>
                      <td>{v.record.ehr || '—'}</td>
                      <td>{v.record.region || '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{v.record.relationshipType}</td>
                      <td>
                        <DataBadge confidence={v.record.sourceConfidence} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {parsed.invalid.length > 0 && (
            <div className="banner warn">
              Skipped {parsed.invalid.length} row(s):{' '}
              {parsed.invalid.map((iv, i) => (
                <div key={i}>
                  • {iv.raw.healthsystem || iv.raw['health system'] || '(no name)'} —{' '}
                  {iv.problems.join('; ')}
                </div>
              ))}
            </div>
          )}

          <div className="banner info">
            This preview builds the full, merged <code>competitor-clients.json</code> (existing{' '}
            {existingClients.length} + your rows, de-duped). Copy or download it, then replace{' '}
            <code>src/data/competitor-clients.json</code> in the repo to publish.
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" onClick={copyJson}>
              {copied ? 'Copied!' : 'Copy merged JSON'}
            </button>
            <button className="btn" onClick={download}>
              Download competitor-clients.json
            </button>
          </div>
        </>
      )}
    </div>
  )
}
