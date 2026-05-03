import type { ReactNode } from 'react';

interface CardFlipProps {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  onFlip: () => void;
}

export default function CardFlip({ front, back, flipped, onFlip }: CardFlipProps) {
  return (
    <div className={`card-flip-container ${flipped ? 'flipped' : ''}`} onClick={onFlip}>
      <div className="card-inner">
        <div className="card-side card-front">
          {front}
        </div>
        <div className="card-side card-back">
          {back}
        </div>
      </div>
    </div>
  );
}