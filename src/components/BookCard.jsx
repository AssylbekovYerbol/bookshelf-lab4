import BookCover from './BookCover.jsx';
import RatingStars from './RatingStars.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function BookCard({ book, onOpen, onToggleFavorite, favoritePending = false }) {
  return (
    <article className="card">
      <BookCover book={book} />
      <div className="card__body">
        <h3 className="card__title">
          <button type="button" className="link-button" onClick={() => onOpen(book.id)}>
            {book.title}
          </button>
        </h3>
        <p className="card__author">{book.author}</p>
        <p className="card__meta">
          {book.genre} · {book.year}
        </p>
        <div className="card__footer">
          <RatingStars value={book.rating} />
          <StatusBadge status={book.status} />
        </div>
      </div>
      <button
        type="button"
        className={`fav-btn${book.favorite ? ' is-active' : ''}`}
        onClick={() => onToggleFavorite(book)}
        disabled={favoritePending}
        aria-pressed={book.favorite}
        aria-label={book.favorite ? `Remove ${book.title} from favourites` : `Add ${book.title} to favourites`}
      >
        ♥
      </button>
    </article>
  );
}
