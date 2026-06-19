import { useState } from 'react'
import playbook from '../data/playbook.json'

const TABS = [
  { key: 'objections', label: 'Objection Handling' },
  { key: 'discovery', label: 'Discovery Questions' },
  { key: 'roi', label: 'ROI Talking Points' },
  { key: 'wins', label: 'Win Stories' },
]

export default function Playbook() {
  const [tab, setTab] = useState('objections')
  const [search, setSearch] = useState('')

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Field Kit</div>
        <h1>Sales Playbook</h1>
        <p>
          The talk tracks a CRM doesn't give you: objection responses, discovery questions, ROI
          drivers, and win stories — ready to use in the field.
        </p>
      </div>

      <div className="subnav">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'objections' && <Objections search={search} setSearch={setSearch} />}
      {tab === 'discovery' && <Discovery />}
      {tab === 'roi' && <Roi />}
      {tab === 'wins' && <Wins />}
    </div>
  )
}

function Objections({ search, setSearch }) {
  const q = search.toLowerCase()
  const rows = playbook.objections.filter(
    (o) =>
      !q ||
      o.objection.toLowerCase().includes(q) ||
      o.response.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q)
  )
  return (
    <div>
      <div className="field" style={{ marginBottom: 16, maxWidth: 360 }}>
        <label htmlFor="obj-search">Search objections</label>
        <input
          id="obj-search"
          type="search"
          placeholder="e.g. budget, DAX, accuracy…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {rows.map((o, i) => (
        <div className="card" key={i} style={{ marginBottom: 12 }}>
          <span className="badge cat">{o.category}</span>
          <div className="qa" style={{ marginTop: 10 }}>
            <div className="q">“{o.objection}”</div>
            <div className="a">{o.response}</div>
          </div>
        </div>
      ))}
      {rows.length === 0 && <div className="empty">No objections match “{search}”.</div>}
    </div>
  )
}

function Discovery() {
  return (
    <div className="card-grid">
      {playbook.discoveryQuestions.map((g, i) => (
        <div className="card" key={i}>
          <h3>{g.theme}</h3>
          <ul className="list-clean">
            {g.questions.map((qn, j) => (
              <li key={j}>{qn}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Roi() {
  return (
    <div>
      <div className="banner info">
        Use these drivers to frame value on the buyer's own numbers. Figures are directional —
        model specifics with the prospect's provider counts.
      </div>
      {playbook.roiTalkingPoints.map((r, i) => (
        <div className="card" key={i} style={{ marginBottom: 12 }}>
          <div className="spread">
            <h3 style={{ marginBottom: 2 }}>{r.driver}</h3>
            <span className="badge known">{r.stat}</span>
          </div>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            {r.note}
          </p>
        </div>
      ))}
    </div>
  )
}

function Wins() {
  return (
    <div>
      <div className="banner warn">Win stories are illustrative — replace with approved, real references.</div>
      <div className="card-grid">
        {playbook.winStories.map((w, i) => (
          <div className="card" key={i}>
            <span className="badge cat">{w.setting}</span>
            <p style={{ marginTop: 10 }}>{w.story}</p>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              <strong>Outcome:</strong> {w.outcome}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
