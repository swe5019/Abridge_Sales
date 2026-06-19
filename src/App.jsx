import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CompetitorLandscape from './pages/CompetitorLandscape.jsx'
import Battlecards from './pages/Battlecards.jsx'
import CompetitorClients from './pages/CompetitorClients.jsx'
import TargetAccounts from './pages/TargetAccounts.jsx'
import Methodology from './pages/Methodology.jsx'
import News from './pages/News.jsx'
import Playbook from './pages/Playbook.jsx'
import meta from './data/meta.json'

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/landscape" element={<CompetitorLandscape />} />
          <Route path="/battlecards" element={<Battlecards />} />
          <Route path="/battlecards/:competitorId" element={<Battlecards />} />
          <Route path="/competitor-clients" element={<CompetitorClients />} />
          <Route path="/target-accounts" element={<TargetAccounts />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="/news" element={<News />} />
          <Route path="/playbook" element={<Playbook />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
      <footer className="footer">
        Abridge Sales Enablement · Internal use only · Data last updated {meta.lastUpdated}
      </footer>
    </div>
  )
}
