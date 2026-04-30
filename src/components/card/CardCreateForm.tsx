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
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">
          Front (question):
          <input
            className="form-input"
            type="text"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="form-group">
        <label className="form-label">
          Back (answer):
          <input
            className="form-input"
            type="text"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">+ Add Card</button>
      </div>
    </form>
  );
}
