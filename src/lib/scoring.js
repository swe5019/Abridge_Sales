import meta from '../data/meta.json'

// Fit score is derived at render time from each account's raw fitFactors
// (each 1-5) and the weights in meta.json. Keeping the math here means the
// Target Accounts table and the Methodology page can never drift apart.

const FACTOR_KEYS = ['ehrFit', 'greenfield', 'size', 'region']

export function computeFitScore(account, weights = meta.scoringWeights) {
  const factors = account.fitFactors || {}
  let weighted = 0
  let weightTotal = 0
  for (const key of FACTOR_KEYS) {
    const w = weights[key] ?? 0
    const v = factors[key] ?? 0
    weighted += (v / 5) * w
    weightTotal += w
  }
  if (weightTotal === 0) return 0
  // Normalize to a 0-100 score regardless of how weights sum.
  return Math.round((weighted / weightTotal) * 100)
}

export function scoreTier(score) {
  if (score >= 75) return 'hot'
  if (score >= 55) return 'warm'
  return 'cool'
}

export function scoreTierLabel(score) {
  const tier = scoreTier(score)
  return tier === 'hot' ? 'Hot' : tier === 'warm' ? 'Warm' : 'Cool'
}

export { FACTOR_KEYS }
