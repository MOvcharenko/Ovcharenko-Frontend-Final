import { useParams, Link } from 'react-router-dom'

function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>()

  // Placeholder: In a real app, this would be fetched from state/context
  const deckTitle = `Deck ${deckId}`
  const cards = [
    { id: '1', front: 'Question 1', back: 'Answer 1', status: 'new' as const },
    { id: '2', front: 'Question 2', back: 'Answer 2', status: 'learning' as const },
    { id: '3', front: 'Question 3', back: 'Answer 3', status: 'review' as const },
    { id: '4', front: 'Question 4', back: 'Answer 4', status: 'mastered' as const },
  ]

  return (
    <div className="deck-detail-page">
      <h1>{deckTitle}</h1>

      <section className="deck-info">
        <p className="deck-description">Placeholder deck description</p>
        <div className="deck-stats">
          <span>{cards.length} cards</span>
        </div>
      </section>

      <section className="cards-list">
        <h2>Cards</h2>
        <div className="cards">
          {cards.map((card) => (
            <div key={card.id} className={`card card-${card.status}`}>
              <div className="card-front">{card.front}</div>
              <div className="card-back">{card.back}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="action-section">
        <Link to={`/decks/${deckId}/study`} className="btn btn-primary">
          Start Study Session
        </Link>
      </section>
    </div>
  )
}

export default DeckDetailPage
