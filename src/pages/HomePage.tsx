import React from 'react';
import { useFlashcardsContext } from '../context/FlashcardsContext';
import DeckList from '../components/deck/DeckList';
import DeckCreateForm from '../components/deck/DeckCreateForm';
import FastDeckCreate from '../components/deck/FastDeckCreate';
import StatsCard from '../components/study/StatsCard';
import PageTitle from '../components/common/PageTitle';
import Subtitle from '../components/common/Subtitle';

function HomePage() {
  const { decks, addDeck, addDeckWithCards, deleteDeck, getCardsDueToday } = useFlashcardsContext();

  const cardsDueToday = getCardsDueToday().length;

  function handleCreateDeck(title: string, description: string) {
    addDeck(title, description);
  }

  function handleFastCreate(title: string, description: string, cards: { front: string; back: string }[]) {
    addDeckWithCards(title, description, cards);
  }

  return (
    <div className="home-page">
      <PageTitle>Study Flashcard System</PageTitle>
      <Subtitle>Welcome to FlashFlow</Subtitle>

      <section className="stats">
        <StatsCard label="Cards Due Today" value={cardsDueToday} />
        <StatsCard label="Total Decks" value={decks.length} />
      </section>

      <section className="decks-section">
        <h2>Your Decks</h2>
        <DeckList decks={decks} onDelete={deleteDeck} />
      </section>

      <section className="action-section">
        <FastDeckCreate onCreate={handleFastCreate} />
        <DeckCreateForm onCreate={handleCreateDeck} />
      </section>
    </div>
  );
}

export default React.memo(HomePage);