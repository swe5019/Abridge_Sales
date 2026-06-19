import meta from '../data/meta.json'
import { FACTOR_KEYS } from '../lib/scoring'

export default function Methodology() {
  const weights = meta.scoringWeights
  const total = Object.values(weights).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">How It Works</div>
        <h1>Fit Scoring Methodology</h1>
        <p>
          The fit score on the Target Accounts page is a transparent, weighted model — not a
          black box. It exists to help you prioritize, not to replace judgment. Here's exactly how
          it's calculated.
        </p>
      </div>

      <div className="section card">
        <h2>The formula</h2>
        <p>
          Each account is rated <strong>1–5</strong> on four factors. Each rating is normalized
          (rating ÷ 5), multiplied by its weight, summed, and scaled to a{' '}
          <strong>0–100</strong> score. Weights live in{' '}
          <code>src/data/meta.json</code> — change them there and both this page and the table
          update automatically.
        </p>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="data">
            <thead>
              <tr>
                <th className="no-sort">Factor</th>
                <th className="no-sort">Weight</th>
                <th className="no-sort">What a 5 looks like</th>
              </tr>
            </thead>
            <tbody>
              {FACTOR_KEYS.map((k) => (
                <tr key={k}>
                  <td>
                    <strong>{meta.factorLabels[k]}</strong>
                  </td>
                  <td>{Math.round((weights[k] / total) * 100)}%</td>
                  <td className="muted">{FACTOR_DESC[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section card">
        <h2>Score tiers</h2>
        <ul className="list-clean">
          <li>
            <span className="score hot">75+</span> &nbsp;<strong>Hot</strong> — prioritize for
            immediate outreach.
          </li>
          <li>
            <span className="score warm">55+</span> &nbsp;<strong>Warm</strong> — strong fit, work
            into the pipeline.
          </li>
          <li>
            <span className="score cool">&lt;55</span> &nbsp;<strong>Cool</strong> — nurture or
            deprioritize.
          </li>
        </ul>
      </div>

      <div className="banner info">
        Fit scores are a model output, never ground truth. The factor ratings and account data are
        illustrative — replace them with verified intel and tune the weights to match how your
        team actually qualifies.
      </div>
    </div>
  )
}

const FACTOR_DESC = {
  ehrFit: 'Epic shop with depth where our native integration is strongest.',
  greenfield: 'No incumbent ambient vendor — a clean, uncontested opportunity.',
  size: 'Large provider count / bed count, maximizing deal size and impact.',
  region: 'Falls in a current strategic / priority region for the team.',
}
