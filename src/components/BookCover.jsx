import { GENRE_HUES } from '../constants';

function getInitials(title) {
  return title
    .split(/\s+/)
    .filter((word) => /^[A-Za-z]/.test(word) && word.length > 2)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/** Generated cover: colour depends on the genre, so no image files are needed. */
export default function BookCover({ book, size = 'md' }) {
  const hue = GENRE_HUES[book.genre] ?? 210;
  return (
    <div
      className={`cover cover--${size}`}
      style={{ background: `linear-gradient(145deg, hsl(${hue} 50% 38%), hsl(${hue} 55% 22%))` }}
      aria-hidden="true"
    >
      <span className="cover__initials">{getInitials(book.title) || book.title[0]}</span>
      <span className="cover__genre">{book.genre}</span>
    </div>
  );
}
