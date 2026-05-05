import type { ReactNode } from 'react';

interface CardFlipProps {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  onFlip: () => void;
}

export default function CardFlip({ front, back, flipped, onFlip }: CardFlipProps) {
  return (
    <div className="card-flip-container" onClick={onFlip}>
      <div className="card-inner">
        {!flipped ? (
          <div className="card-front">
            <div className="card-text">{front}</div>
          </div>
        ) : (
          <div className="card-back">
            <div className="card-text">{back}</div>
          </div>
        )}
      </div>
      <div className="flip-hint">
        <span>🖱️</span> Tap to {flipped ? 'flip back' : 'reveal answer'}
      </div>
    </div>
  );
}