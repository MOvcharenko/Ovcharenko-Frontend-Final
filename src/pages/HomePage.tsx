import React from 'react';
import { useFlashcardsContext } from '../context/FlashcardsContext';
import DeckList from '../components/deck/DeckList';
import DeckCreateForm from '../components/deck/DeckCreateForm';
import StatsCard from '../components/study/StatsCard';
import PageTitle from '../components/common/PageTitle';
import Subtitle from '../components/common/Subtitle';

function HomePage() {
  const { state, addDeck, deleteDeck, getCardsDueToday } = useFlashcardsContext();

  const cardsDueToday = getCardsDueToday().length;

  function handleCreateDeck(title: string, description: string) {
    addDeck(title, description);
  }

  return (
    <div className="home-page">
      <PageTitle>Study Flashcard System</PageTitle>
      <Subtitle>Welcome to FlashFlow</Subtitle>

      <section className="stats">
        <StatsCard label="Cards Due Today" value={cardsDueToday} />
        <StatsCard label="Total Decks" value={state.decks.length} />
      </section>

      <section className="decks-section">
        <h2>Your Decks</h2>
        <DeckList decks={state.decks} onDelete={deleteDeck} />
      </section>

      <section className="action-section">
        <DeckCreateForm onCreate={handleCreateDeck} />
      </section>
    </div>
  );
}

export default React.memo(HomePage);