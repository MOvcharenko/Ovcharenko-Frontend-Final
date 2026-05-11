import { useState } from 'react';

interface FastDeckCreateProps {
  onCreate: (title: string, description: string, cards: { front: string; back: string }[]) => void;
}

export default function FastDeckCreate({ onCreate }: FastDeckCreateProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<{
    title: string;
    description: string;
    cards: { front: string; back: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleParse() {
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Please paste some text first.');
      setPreview(null);
      return;
    }

    const lines = trimmed.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    if (lines.length < 4) {
      setError('Need at least 4 lines: title, description, and one Q&A pair.');
      setPreview(null);
      return;
    }

    const title = lines[0];
    const description = lines[1];

    const cards: { front: string; back: string }[] = [];
    let i = 2;
    while (i < lines.length) {
      const qLine = lines[i];
      const aLine = lines[i + 1];

      if (!qLine || !aLine) {
        setError(`Missing answer for question on line ${i + 1}.`);
        setPreview(null);
        return;
      }

      if (!qLine.startsWith('Q:') && !qLine.startsWith('q:')) {
        setError(`Line ${i + 1} should start with "Q:" — got "${qLine}".`);
        setPreview(null);
        return;
      }

      if (!aLine.startsWith('A:') && !aLine.startsWith('a:')) {
        setError(`Line ${i + 2} should start with "A:" — got "${aLine}".`);
        setPreview(null);
        return;
      }

      cards.push({
        front: qLine.slice(2).trim(),
        back: aLine.slice(2).trim(),
      });

      i += 2;
    }

    if (cards.length === 0) {
      setError('No valid Q&A pairs found.');
      setPreview(null);
      return;
    }

    setPreview({ title, description, cards });
  }

  function handleCreate() {
    if (!preview) return;
    onCreate(preview.title, preview.description, preview.cards);
    setText('');
    setPreview(null);
    setError(null);
  }

  return (
    <div className="fast-deck-create">
      <h3 className="fast-deck-title">⚡ Fast Deck Creation</h3>
      <p className="fast-deck-hint">
        Paste text in this format:
      </p>
      <pre className="fast-deck-format">
{`Deck Title
Short Deck Description
Q: What is the question?
A: This is the answer
Q: Another question?
A: Another answer`}
      </pre>

      <textarea
        className="form-textarea fast-deck-textarea"
        rows={8}
        placeholder="Paste your deck here..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPreview(null);
          setError(null);
        }}
      />

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={handleParse}>
          🔍 Preview
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
        </div>
      )}

      {preview && (
        <div className="fast-deck-preview">
          <h4>{preview.title}</h4>
          <p className="text-muted">{preview.description}</p>
          <p className="text-sm">
            <strong>{preview.cards.length}</strong> card{preview.cards.length !== 1 ? 's' : ''} will be created
          </p>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleCreate}>
              ✅ Create Deck
            </button>
          </div>
        </div>
      )}
    </div>
  );
}