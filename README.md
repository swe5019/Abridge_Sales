# Abridge Sales Enablement

An internal web app for the **Abridge sales team** — the competitive and prospecting
context a CRM can't give you, in one place:

- **Dashboard** — quick stats, top-5 recommended targets, latest news, and how to use the tool.
- **Competitor Landscape** — market map of ambient-AI competitors grouped by type.
- **Battlecards** — head-to-head guidance per competitor: where we win, where they win,
  objection handling, landmines, and proof points.
- **Competitor Clients** — who runs which competitor's product (displacement / expansion intel).
- **Target Accounts** — the flagship prospecting tool: filterable, sortable health-system table
  with a computed **fit score** to pick who to target next.
- **Fit Scoring** — transparent explanation of how the fit score is calculated.
- **Industry News** — curated ambient-AI / health-IT headlines (with optional live feed).
- **Playbook** — objection handling, discovery questions, ROI talking points, win stories.

## Run it locally

Requires Node 18+ (built/tested on Node 22).

```bash
npm install
npm run dev       # opens a dev server, usually http://localhost:5173
```

## Build & deploy (static site)

```bash
npm run build     # outputs static files to dist/
npm run preview   # preview the production build locally
```

The build is a plain static site. Drop the `dist/` folder on any static host —
Netlify, Vercel, GitHub Pages, S3, or internal nginx. No server or database needed.
`base: './'` (in `vite.config.js`) plus hash-based routing mean **no rewrite rules
are required** for deep links to work.

## Updating the data (no coding required)

All content lives in editable JSON files in **`src/data/`** — a sales-ops person can
update these without touching any code:

| File | What it controls |
|------|------------------|
| `competitors.json` | Competitor profiles and the landscape cards |
| `battlecards.json` | Head-to-head battlecards (linked to competitors by `competitorId`) |
| `competitor-clients.json` | Which health system uses which competitor |
| `target-accounts.json` | The prospecting table (and `fitFactors` that drive scores) |
| `news.json` | Curated industry news feed |
| `playbook.json` | Objections, discovery questions, ROI points, win stories |
| `meta.json` | Fit-score weights, size bands, news settings, `lastUpdated` |

After editing, the dev server hot-reloads automatically; for production run
`npm run build` again.

### Data confidence labels

Every record carries a `sourceConfidence` field:

- `known-public` → renders a green **✓ Public** badge (based on public information).
- `illustrative` → renders an amber **◐ Sample** badge. **These are placeholders —
  replace them with verified intel before relying on them in a deal.** Competitor
  vendor identities and positioning are public; specific client rosters and all fit
  scores are seeded as illustrative samples.

### Fit score

The Target Accounts fit score (0–100) is derived from each account's `fitFactors`
(EHR fit, greenfield, size, region — each rated 1–5) and the weights in
`meta.json → scoringWeights`. Change a weight and both the table and the **Fit Scoring**
page update automatically (see `src/lib/scoring.js`).

### Industry news (live + fallback)

`news.json` is always the source of truth and always renders. If you set
`meta.json → liveNews: true` **and** provide a `newsFeedUrl` returning JSON, the News
page also attempts a live fetch and merges the results, silently falling back to the
curated list on any network/CORS failure. For a fully automated pipeline, the robust
approach is a build-time/CI script that fetches and rewrites `news.json` rather than a
runtime browser fetch (not included in this version).

## Tech

Vite + React (JavaScript), `react-router-dom` (HashRouter), plain CSS. No backend,
no database — data is bundled from `src/data/*.json`.
