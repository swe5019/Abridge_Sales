import { Link } from 'react-router-dom'
import competitors from '../data/competitors.json'
import accounts from '../data/target-accounts.json'
import clients from '../data/competitor-clients.json'
import meta from '../data/meta.json'
import { computeFitScore, scoreTier } from '../lib/scoring'
import { curated } from '../lib/news'

const competitorName = (id) => competitors.find((c) => c.id === id)?.name || id

const topTargets = accounts
  .map((a) => ({ ...a, fitScore: computeFitScore(a) }))
  .sort((a, b) => b.fitScore - a.fitScore)
  .slice(0, 5)

const greenfieldCount = accounts.filter((a) => !a.currentAmbientVendor).length
const latestNews = curated.slice(0, 3)

export default function Dashboard() {
  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Abridge Sales Enablement</div>
        <h1>Sales Command Center</h1>
        <p>
          Competitive intel, account targeting, and field-ready talk tracks in one place — the
          context your CRM doesn't give you. Everything here is driven by editable data files.
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="num">{competitors.length}</div>
          <div className="label">Competitors tracked</div>
        </div>
        <div className="stat">
          <div className="num">{accounts.length}</div>
          <div className="label">Target accounts</div>
        </div>
        <div className="stat">
          <div className="num">{greenfieldCount}</div>
          <div className="label">Greenfield opportunities</div>
        </div>
        <div className="stat">
          <div className="num">{clients.length}</div>
          <div className="label">Competitor relationships</div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="section">
          <div className="spread">
            <h2>Top 5 recommended targets</h2>
            <Link className="pill-link" to="/target-accounts">
              All accounts →
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th className="no-sort">Health System</th>
                  <th className="no-sort">EHR</th>
                  <th className="no-sort">Current Vendor</th>
                  <th className="no-sort">Fit</th>
                </tr>
              </thead>
              <tbody>
                {topTargets.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{a.ehr}</td>
                    <td>
                      {a.currentAmbientVendor ? (
                        <span className="badge cat">{competitorName(a.currentAmbientVendor)}</span>
                      ) : (
                        <span className="muted">Greenfield</span>
                      )}
                    </td>
                    <td>
                      <span className={`score ${scoreTier(a.fitScore)}`}>{a.fitScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <div className="spread">
            <h2>Latest industry news</h2>
            <Link className="pill-link" to="/news">
              All news →
            </Link>
          </div>
          {latestNews.map((n) => (
            <div className="news-item" key={n.id}>
              <div className="meta">
                <span>{n.date}</span>
                <span>·</span>
                <span>{n.source}</span>
              </div>
              <h3 style={{ fontSize: 15 }}>
                <a href={n.url} target="_blank" rel="noreferrer">
                  {n.title}
                </a>
              </h3>
            </div>
          ))}
        </div>
      </div>

      <div className="section card">
        <h2>How to use this tool</h2>
        <div className="split-cols">
          <div>
            <ul className="list-clean">
              <li>
                <strong><Link to="/target-accounts">Target Accounts</Link></strong> — filter &
                sort prospects by fit score to pick who to call next.
              </li>
              <li>
                <strong><Link to="/battlecards">Battlecards</Link></strong> — how to win against
                each competitor, with objection handling.
              </li>
              <li>
                <strong><Link to="/competitor-clients">Competitor Clients</Link></strong> — find
                displacement opportunities by vendor.
              </li>
              <li>
                <strong><Link to="/playbook">Playbook</Link></strong> — discovery questions, ROI
                drivers, and win stories for the field.
              </li>
            </ul>
          </div>
          <div>
            <div className="banner warn" style={{ marginBottom: 0 }}>
              <strong>Keeping it current:</strong> all content lives in editable JSON files under{' '}
              <code>src/data/</code> — no coding required. Records marked{' '}
              <span className="badge illustrative">◐ Sample</span> are illustrative; replace them
              with verified intel. Data last updated {meta.lastUpdated}.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
