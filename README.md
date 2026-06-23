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
| `competitor-clients.json` | Which health system uses which competitor (verified roster) |
| `client-leads.json` | Auto-surfaced, **unverified** competitor deal leads (deal radar) |
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

### Industry news (auto-updated from real sources)

The **Industry News** page reads `src/data/news.json`, which is refreshed automatically
by a scheduled GitHub Action — no manual upkeep, and no runtime browser fetch (so there
are no CORS or API-key issues, and the site stays fully static).

- **`scripts/fetch-news.mjs`** pulls real headlines from public RSS feeds (Google News
  topic searches for the ambient-AI / clinical-documentation space), filters them for
  relevance, de-duplicates, tags them, and writes `news.json`. If it can't gather any
  items (e.g. a transient network issue), it leaves the existing file untouched.
- **`.github/workflows/update-news.yml`** runs that script every 6 hours (and on demand
  via the Actions tab), commits any changes, and redeploys the site.

Run it yourself anytime with `npm run update-news`. To change what's tracked, edit the
`FEEDS` and `RELEVANCE` lists at the top of `scripts/fetch-news.mjs` — add any public
RSS/Atom feed URL; feeds that fail are skipped automatically.

### Competitor-client intel: deal radar + bulk importer

Most of "who uses which ambient vendor" isn't cleanly public, so two tools help build a
verified roster on the **Competitor Clients** page:

- **Deal radar** (`scripts/fetch-client-leads.mjs`, `npm run update-leads`) — scans public
  news for competitor *adoption / partnership* announcements and lists them as **unverified
  candidate deals**. It runs on the same schedule as the news job. A human reviews each and
  promotes the real ones into the verified table.
- **Bulk importer** ("+ Bulk add clients" button) — paste CSV/TSV rows (from a spreadsheet)
  and it validates them, previews the table, and produces a merged `competitor-clients.json`
  to copy or download. Rows with a `publicSource` URL are auto-marked **✓ Public**.

## Tech

Vite + React (JavaScript), `react-router-dom` (HashRouter), plain CSS. No backend,
no database — data is bundled from `src/data/*.json`. `fast-xml-parser` is a dev-only
dependency used by the news / deal-radar scripts (not shipped in the app bundle).
