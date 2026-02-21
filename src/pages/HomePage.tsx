import { Link } from 'react-router-dom'

function HomePage() {
  // Placeholder: In a real app, this would be populated from state/context
  const decks = [
    { id: '1', title: 'Spanish Vocabulary', description: 'Common Spanish words' },
    { id: '2', title: 'Math Formulas', description: 'Important mathematical formulas' },
    { id: '3', title: 'Biology Terms', description: 'Key biology definitions' },
  ]

  const cardsDueToday = 12

  return (
    <div className="home-page">
      <h1>Study Flashcard System</h1>
      <p className="subtitle">Welcome to FlashFlow</p>

      <section className="stats">
        <div className="stat-card">
          <h3>{cardsDueToday}</h3>
          <p>Cards Due Today</p>
        </div>
      </section>

      <section className="decks-section">
        <h2>Your Decks</h2>
        <div className="decks-list">
          {decks.map((deck) => (
            <div key={deck.id} className="deck-item">
              <Link to={`/decks/${deck.id}`}>
                <h3>{deck.title}</h3>
                <p>{deck.description}</p>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="action-section">
        <button>+ Create New Deck</button>
      </section>
    </div>
  )
}

export default HomePage
