import { useFlashcards } from '../hooks/useFlashcards';
import DeckList from '../components/DeckList';
import StatsCard from '../components/StatsCard';
import PageTitle from '../components/PageTitle';
import Subtitle from '../components/Subtitle';

function HomePage() {
  const { state, addDeck, deleteDeck, getCardsDueToday } = useFlashcards();

  const cardsDueToday = getCardsDueToday().length;

  function handleCreateDeck() {
    const title = prompt('Deck title:');
    if (!title?.trim()) return;
    const description = prompt('Deck description:') ?? '';
    addDeck(title.trim(), description.trim());
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
        <button onClick={handleCreateDeck}>+ Create New Deck</button>
      </section>
    </div>
  );
}

export default HomePage;