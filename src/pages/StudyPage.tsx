import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Rating } from '../types'

function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>()
  const [isFlipped, setIsFlipped] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  // Placeholder: In a real app, this would come from state/context
  const cards = [
    { id: '1', front: 'Question 1', back: 'Answer 1' },
    { id: '2', front: 'Question 2', back: 'Answer 2' },
    { id: '3', front: 'Question 3', back: 'Answer 3' },
    { id: '4', front: 'Question 4', back: 'Answer 4' },
  ]

  const currentCard = cards[currentCardIndex]
  const isLastCard = currentCardIndex === cards.length - 1

  const handleRating = (rating: Rating) => {
    console.log(`Rated "${rating}" for card: `, currentCard)

    if (isLastCard) {
      console.log('Study session complete!')
      // TODO: Navigate back or show completion screen
    } else {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="study-page">
      <div className="study-header">
        <h1>Study Deck {deckId}</h1>
        <div className="progress">
          Card {currentCardIndex + 1} of {cards.length}
        </div>
      </div>

      <div className="study-container">
        <div className={`card-flip-container ${isFlipped ? 'flipped' : ''}`}>
          <div className="card-content" onClick={handleFlip}>
            <div className="card-side front">
              <p>{isFlipped ? currentCard.back : currentCard.front}</p>
            </div>
            <p className="flip-hint">Click to flip</p>
          </div>
        </div>

        <div className="rating-buttons">
          <button
            className="btn btn-again"
            onClick={() => handleRating('again')}
          >
            Again
          </button>
          <button
            className="btn btn-hard"
            onClick={() => handleRating('hard')}
          >
            Hard
          </button>
          <button
            className="btn btn-good"
            onClick={() => handleRating('good')}
          >
            Good
          </button>
          <button
            className="btn btn-easy"
            onClick={() => handleRating('easy')}
          >
            Easy
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudyPage
