# Clone guide — build a similar site in a new repo

This site is a **static, data-driven React + Vite app deployed to GitHub Pages.**
Copy the *scaffolding*, swap the *content*, flip one setting. ~20 minutes.

> Tip for a Claude Code session: "Read this guide and scaffold a site like the
> Abridge one for **<topic>** in repo **<name>**." Make sure the new repo is added
> to the session's access first.

## 1. Copy the scaffolding (framework, not content)
From this repo, copy into the new repo:
- `package.json`, `package-lock.json`, `vite.config.js` (keep **`base: './'`**)
- `index.html`
- `src/` — but plan to replace `src/data/*` and rebrand `src/components/NavBar.jsx`
  and page copy
- `.github/workflows/deploy.yml` — the auto-deploy (unchanged)
- **Optional** `.github/workflows/update-news.yml` + `scripts/*.mjs` — only if the
  new site needs scheduled data refresh; otherwise delete both.

## 2. Rebrand + re-content
- `index.html` → `<title>`.
- `src/components/NavBar.jsx` → site name, logo letter, nav links.
- `src/App.jsx` → the routes/pages you actually want (delete the rest).
- `src/data/*.json` → **your** data. This is where it becomes a different site.
  Keep the `sourceConfidence` / `source` convention if you care about
  verified-vs-sample provenance.
- `src/styles/theme.css` → colors/branding.

## 3. Create the repo and push
```
git init && git add -A && git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<owner>/<NewRepo>.git
git push -u origin main
```

## 4. Turn on GitHub Pages — the must-do step
Repo **Settings → Pages → Build and deployment → Source → "GitHub Actions."**
- Do NOT choose "Deploy from a branch" — that serves raw source and yields a
  **blank white page**.
- After the first `deploy.yml` run succeeds, the site is at
  `https://<owner>.github.io/<NewRepo>/` (**case-sensitive** path).

## 5. Verify
- Actions tab → "Deploy to GitHub Pages" run is green.
- Open the URL in an **incognito** window (avoids cached blank pages from any
  earlier failed deploy).

## Gotchas (learned the hard way)
- **Blank white page** → Pages Source isn't "GitHub Actions" (step 4), or you're
  hitting a cached old deploy (hard-refresh / incognito).
- **`HashRouter`** is used on purpose — it avoids 404s on deep links under the
  Pages subpath. Don't switch to `BrowserRouter` without adding SPA-fallback config.
- **`base: './'`** in `vite.config.js` must stay for assets to resolve under the
  `/<RepoName>/` subpath.
- **Scheduled data commits** use `[skip ci]`, so they don't auto-redeploy — re-run
  the deploy workflow to push refreshed data live.
- After a **squash merge**, confirm `main` actually contains your change (stale PR
  heads can drop commits).
