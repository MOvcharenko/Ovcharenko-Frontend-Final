import React, { useState } from 'react';

interface CardCreateFormProps {
  onCreate: (front: string, back: string) => void;
}

export default function CardCreateForm({ onCreate }: CardCreateFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    onCreate(front.trim(), back.trim());
    setFront('');
    setBack('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Front (question):
        <input
          type="text"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          required
        />
      </label>
      <label>
        Back (answer):
        <input
          type="text"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          required
        />
      </label>
      <button type="submit">+ Add Card</button>
    </form>
  );
}
