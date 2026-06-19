import { useParams, useNavigate, Link } from 'react-router-dom'
import competitors from '../data/competitors.json'
import battlecards from '../data/battlecards.json'
import DataBadge from '../components/DataBadge.jsx'

const competitor = (id) => competitors.find((c) => c.id === id)

export default function Battlecards() {
  const { competitorId } = useParams()
  const navigate = useNavigate()

  if (competitorId) {
    const bc = battlecards.find((b) => b.competitorId === competitorId)
    const comp = competitor(competitorId)
    if (!bc || !comp) {
      return (
        <div>
          <p>Battlecard not found.</p>
          <Link to="/battlecards">← All battlecards</Link>
        </div>
      )
    }
    return <BattlecardDetail bc={bc} comp={comp} onBack={() => navigate('/battlecards')} />
  }

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Sell Against</div>
        <h1>Battlecards</h1>
        <p>
          Head-to-head guidance for every competitor: where Abridge wins, where they win,
          objection handling, landmines to plant, and proof points. Pick a competitor.
        </p>
      </div>
      <div className="banner warn">
        Talk tracks are illustrative starting points — validate proof points and pricing claims
        with current, approved messaging before using in a deal.
      </div>
      <div className="card-grid">
        {battlecards.map((bc) => {
          const comp = competitor(bc.competitorId)
          if (!comp) return null
          return (
            <Link
              key={bc.id}
              to={`/battlecards/${bc.competitorId}`}
              className="card"
              style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
            >
              <div className="spread">
                <h3 style={{ marginBottom: 2 }}>{comp.name}</h3>
                <span className="badge cat">{comp.category}</span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                {comp.company}
              </div>
              <p style={{ fontSize: 14, margin: 0 }}>{bc.summary}</p>
              <div className="pill-link" style={{ marginTop: 10, color: 'var(--brand)' }}>
                Open battlecard →
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function BattlecardDetail({ bc, comp, onBack }) {
  return (
    <div>
      <button className="btn back-link" onClick={onBack}>
        ← All battlecards
      </button>
      <div className="page-head">
        <div className="eyebrow">Battlecard · {comp.company}</div>
        <h1>
          Abridge vs. {comp.name} <DataBadge confidence={bc.sourceConfidence} />
        </h1>
        <p>{bc.summary}</p>
      </div>

      <div className="split-cols section">
        <div className="card">
          <h2>✅ Where Abridge wins</h2>
          <ul className="list-clean">
            {bc.whereWeWin.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2>⚠️ Where they win</h2>
          <ul className="list-clean">
            {bc.whereTheyWin.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="section">
        <h2>Objection handling</h2>
        {bc.objections.map((o, i) => (
          <div className="qa" key={i}>
            <div className="q">“{o.objection}”</div>
            <div className="a">{o.response}</div>
          </div>
        ))}
      </div>

      <div className="split-cols section">
        <div className="card">
          <h2>💣 Landmines to plant</h2>
          <ul className="list-clean">
            {bc.landmines.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2>🏆 Proof points</h2>
          <ul className="list-clean">
            {bc.proofPoints.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="section">
        <h2>Competitor snapshot</h2>
        <div className="card">
          <dl className="kv">
            <dt>Positioning</dt>
            <dd>{comp.positioning}</dd>
            <dt>EHR integrations</dt>
            <dd>{comp.ehrIntegrations.join(', ')}</dd>
            <dt>Pricing notes</dt>
            <dd>{comp.pricingNotes}</dd>
            <dt>Website</dt>
            <dd>
              <a href={comp.website} target="_blank" rel="noreferrer">
                {comp.website}
              </a>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}
