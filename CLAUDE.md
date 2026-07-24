# CLAUDE.md — project guide for AI sessions

This file is auto-read at the start of a Claude Code session. It captures how this
site is built, run, and deployed so a fresh session (with no memory of past chats)
can work confidently. **To spin up a similar site in another repo, see
[`docs/CLONE-GUIDE.md`](docs/CLONE-GUIDE.md).**

## What this is
A **static, data-driven React site** — an internal "sales enablement" tool for
Abridge (ambient-AI clinical documentation). No server, no database: every page
renders from JSON files in `src/data/`. It auto-deploys to **GitHub Pages**.

Live URL: `https://<owner>.github.io/Abridge_Sales/` (path is **case-sensitive**).

## Stack
- **Vite + React** (SPA), `react-router-dom` using **`HashRouter`** (so deep links
  work on GitHub Pages with no server rewrites).
- `vite.config.js` sets **`base: './'`** — keeps the build portable under any subpath.
- Plain CSS in `src/styles/`. No component library.

## Layout
```
index.html            # app shell (dev references /src/main.jsx; build rewrites this)
vite.config.js        # base: './'
src/
  main.jsx            # mounts <HashRouter><App/></HashRouter>
  App.jsx             # <Routes> — one <Route> per page
  components/         # NavBar, DataTable, FilterBar, DataBadge, ClientImporter, ...
  pages/             # Dashboard, CompetitorLandscape, Battlecards, CompetitorClients,
                     #   TargetAccounts, Methodology, News, Playbook
  lib/               # scoring, filters, confidence, news, csv (pure helpers)
  data/              # *** all content lives here as JSON ***
  styles/            # theme.css, app.css
scripts/             # fetch-news.mjs, fetch-client-leads.mjs (scheduled data refresh)
.github/workflows/
  deploy.yml         # build + publish to GitHub Pages on push to main
  update-news.yml    # scheduled: run scripts, commit refreshed data, redeploy
```

## Data model (`src/data/`)
- `target-accounts.json` — prospect health systems. Fields: `name, region, state,
  beds, hospitals, careSites, ehr, currentAmbientVendor, physicianCount, fitFactors
  {ehrFit,greenfield,size,region}, notes, sourceConfidence, source`.
  - `currentAmbientVendor`: `null` (no known vendor), a competitor id from
    `competitors.json`, or `"abridge"` (existing customer — rendered specially).
  - Fit score is **computed** from `fitFactors` (see `lib/scoring.js`), not stored.
- `competitors.json` — the tracked ambient-AI vendors (id, name, category, ...).
- `competitor-clients.json` — real, publicly-sourced health systems using each
  competitor (`competitorId, healthSystem, ehr, region, relationshipType,
  publicSource, sourceConfidence`). Drives the "public client(s) tracked" counts.
- `news.json`, `client-leads.json` — refreshed by the scheduled scripts.
- `battlecards.json`, `playbook.json`, `meta.json` — page content / config.

### Data conventions
- `sourceConfidence: "known-public"` → renders a **✓ Public** badge and hides the
  "sample data" banner. `"illustrative"` → **◐ Sample** badge (placeholder data).
- **Never fabricate figures.** If a value isn't publicly sourced, use `null` and
  render `—`. Add a `source`/`publicSource` URL for public facts.

## Run / build
```
npm ci
npm run dev      # local dev server
npm run build    # production build -> dist/
```

## Deployment — READ THIS
- Push to `main` → `deploy.yml` builds and publishes to GitHub Pages.
- **One-time repo setting (critical):** Settings → Pages → Build and deployment →
  **Source = "GitHub Actions."** If this is set to "Deploy from a branch," GitHub
  serves the raw `index.html` (which points at `/src/main.jsx`) and you get a
  **blank white page**. This is the #1 gotcha.
- `update-news.yml` runs on a schedule (and on demand via the Actions tab). Its
  commits use `[skip ci]`, so a manual "Deploy to GitHub Pages" run is needed to
  push freshly-fetched data live (or just re-run after the data commit).

## Git workflow
- Develop on branch `claude/abridge-sales-website-1cqf94`; open a PR to `main`; merge.
- **Squash merges can silently drop later commits if the PR head is stale** — after
  merging, verify `main` actually contains your change before declaring done.
