import { useFlashcardsContext } from '../context/FlashcardsContext';

export default function ErrorBanner() {
  const { error, setError } = useFlashcardsContext();

  if (!error) return null;

  return (
    <div className="error-banner">
      <span>{error}</span>
      <button
        className="error-dismiss"
        onClick={() => setError(null)}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}
