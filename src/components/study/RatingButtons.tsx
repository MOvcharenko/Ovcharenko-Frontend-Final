import type { Rating } from '../types';

interface RatingButtonsProps {
  onRate: (r: Rating) => void;
}

export default function RatingButtons({ onRate }: RatingButtonsProps) {
  return (
    <div className="rating-buttons">
      <button className="btn btn-again" onClick={() => onRate('again')}>
        Again
      </button>
      <button className="btn btn-hard" onClick={() => onRate('hard')}>
        Hard
      </button>
      <button className="btn btn-good" onClick={() => onRate('good')}>
        Good
      </button>
      <button className="btn btn-easy" onClick={() => onRate('easy')}>
        Easy
      </button>
    </div>
  );
}
