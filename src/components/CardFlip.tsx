import type { ReactNode } from 'react';

interface CardFlipProps {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  onFlip: () => void;
}

export default function CardFlip({ front, back, flipped, onFlip }: CardFlipProps) {
  return (
    <div className={`card-flip-container ${flipped ? 'flipped' : ''}`}> 
      <div className="card-content" onClick={onFlip}>
        <div className="card-side front">
          {flipped ? back : front}
        </div>
        <p className="flip-hint">Click to flip</p>
      </div>
    </div>
  );
}
