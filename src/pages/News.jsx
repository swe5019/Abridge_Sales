import { useState, useMemo } from 'react'
import { curated, latestDate } from '../lib/news'

export default function News() {
  const [tag, setTag] = useState('')
  const items = curated

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
          Real ambient-AI and healthcare-IT headlines, refreshed automatically from public news
          sources by a scheduled job. Filter by topic to prep outreach and track competitive moves.
        </p>
      </div>

      <div className="banner info">
        Headlines update automatically several times a day.
        {latestDate && <> Most recent story: <strong>{latestDate}</strong>.</>}
      </div>

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
