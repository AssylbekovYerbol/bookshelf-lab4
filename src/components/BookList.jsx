import BookCard from './BookCard.jsx';

export default function BookList({ books, onOpen, onToggleFavorite, pendingFavoriteId }) {
  return (
    <ul className="grid">
      {books.map((book) => (
        // book.id is stable and unique, so React can keep card identity between renders
        <li key={book.id}>
          <BookCard
            book={book}
            onOpen={onOpen}
            onToggleFavorite={onToggleFavorite}
            favoritePending={pendingFavoriteId === book.id}
          />
        </li>
      ))}
    </ul>
  );
}
