import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import competitors from '../data/competitors.json'
import clients from '../data/competitor-clients.json'
import battlecards from '../data/battlecards.json'
import DataBadge from '../components/DataBadge.jsx'

const clientCount = (id) => clients.filter((c) => c.competitorId === id).length
const hasBattlecard = (id) => battlecards.some((b) => b.competitorId === id)

export default function CompetitorLandscape() {
  // Group competitors by category to form a simple "market map".
  const groups = useMemo(() => {
    const map = new Map()
    for (const c of competitors) {
      if (!map.has(c.category)) map.set(c.category, [])
      map.get(c.category).push(c)
    }
    return Array.from(map.entries())
  }, [])

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Market Map</div>
        <h1>Competitor Landscape</h1>
        <p>
          The ambient clinical documentation field, grouped by competitor type. Vendor identities
          and positioning are public; client counts below are illustrative samples.
        </p>
      </div>

      {groups.map(([category, comps]) => (
        <div className="section" key={category}>
          <h2>{category}</h2>
          <div className="card-grid">
            {comps.map((c) => (
              <div className="card" key={c.id}>
                <div className="spread">
                  <h3 style={{ marginBottom: 2 }}>{c.name}</h3>
                  <DataBadge confidence={c.sourceConfidence} />
                </div>
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  {c.company} · {c.stage}
                </div>
                <p style={{ fontSize: 14 }}>{c.positioning}</p>
                <div className="tag-row" style={{ margin: '10px 0' }}>
                  {c.ehrIntegrations.map((e) => (
                    <span className="badge tag" key={e}>
                      {e}
                    </span>
                  ))}
                </div>
                <div className="spread" style={{ fontSize: 13 }}>
                  <span className="muted">{clientCount(c.id)} sample client(s) tracked</span>
                  {hasBattlecard(c.id) && (
                    <Link className="pill-link" to={`/battlecards/${c.id}`}>
                      Battlecard →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
