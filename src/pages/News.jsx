import { useState, useEffect, useMemo } from 'react'
import { loadNews, curated } from '../lib/news'
import meta from '../data/meta.json'

export default function News() {
  const [items, setItems] = useState(curated)
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(meta.liveNews && !!meta.newsFeedUrl)
  const [tag, setTag] = useState('')

  useEffect(() => {
    let active = true
    if (meta.liveNews && meta.newsFeedUrl) {
      loadNews().then((res) => {
        if (!active) return
        setItems(res.items)
        setLive(res.live)
        setLoading(false)
      })
    }
    return () => {
      active = false
    }
  }, [])

  const tags = useMemo(() => {
    const set = new Set()
    items.forEach((i) => i.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [items])

  const filtered = tag ? items.filter((i) => i.tags.includes(tag)) : items

  return (
    <div>
      <div className="page-head">
        <div className="eyebrow">Stay Sharp</div>
        <h1>Industry News</h1>
        <p>
          Curated ambient-AI and healthcare-IT headlines to fuel outreach and stay ahead of
          competitive moves. Filter by topic.
        </p>
      </div>

      {loading ? (
        <div className="banner info">Checking for live updates…</div>
      ) : live ? (
        <div className="banner info">Showing live feed merged with the curated list.</div>
      ) : (
        <div className="banner warn">
          Showing the curated list ({meta.newsFeedUrl ? 'live feed unavailable' : 'live feed not configured'}).
          Items are illustrative samples — update <code>src/data/news.json</code>, or set{' '}
          <code>newsFeedUrl</code> in <code>meta.json</code> for a live feed.
        </div>
      )}

      <div className="subnav">
        <button className={tag === '' ? 'active' : ''} onClick={() => setTag('')}>
          All
        </button>
        {tags.map((t) => (
          <button key={t} className={tag === t ? 'active' : ''} onClick={() => setTag(t)}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty">No news items for this topic.</div>}

      {filtered.map((item) => (
        <article className="news-item" key={item.id}>
          <div className="meta">
            <span>{item.date}</span>
            <span>·</span>
            <span>{item.source}</span>
            {item.tags.map((t) => (
              <span className="badge tag" key={t}>
                {t}
              </span>
            ))}
          </div>
          <h3>
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.title}
            </a>
          </h3>
          <p>{item.summary}</p>
        </article>
      ))}
    </div>
  )
}
