import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/landscape', label: 'Competitor Landscape' },
  { to: '/battlecards', label: 'Battlecards' },
  { to: '/competitor-clients', label: 'Competitor Clients' },
  { to: '/target-accounts', label: 'Target Accounts' },
  { to: '/methodology', label: 'Fit Scoring' },
  { to: '/news', label: 'Industry News' },
  { to: '/playbook', label: 'Playbook' },
]

export default function NavBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/" className="brand-mark" end>
          <span className="brand-logo">A</span>
          <span>
            Abridge <span className="brand-sub">Sales Enablement</span>
          </span>
        </NavLink>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
