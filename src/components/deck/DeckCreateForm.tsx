import React, { useState } from 'react';

interface DeckCreateFormProps {
  onCreate: (title: string, description: string) => void;
}

export default function DeckCreateForm({ onCreate }: DeckCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), description.trim());
    setTitle('');
    setDescription('');
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">
          Title:
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
      </div>
      <div className="form-group">
        <label className="form-label">
          Description:
          <input
            className="form-input"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">+ Create New Deck</button>
      </div>
    </form>
  );
}
