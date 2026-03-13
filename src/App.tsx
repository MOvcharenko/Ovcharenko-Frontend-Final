import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import DeckDetailPage from './pages/DeckDetailPage'
import StudyPage from './pages/StudyPage'
import ErrorBanner from './components/ErrorBanner'

function App() {
  return (
    <div className="app">
      <nav className="top-nav">
        <Link to="/" className="nav-title">
          FlashFlow
        </Link>
      </nav>

      <main className="main-content">
        <ErrorBanner />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/decks/:deckId" element={<DeckDetailPage />} />
          <Route path="/decks/:deckId/study" element={<StudyPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
