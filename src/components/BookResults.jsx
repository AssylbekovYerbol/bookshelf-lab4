import BookList from './BookList.jsx';
import EmptyState from './EmptyState.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import Loader from './Loader.jsx';

/**
 * Chooses which of the four request states to render:
 * error → loading (first load) → empty → success (list, dimmed while refetching).
 */
export default function BookResults({ request, hasFilters, onRetry, onClearFilters, onOpen, onToggleFavorite, pendingFavoriteId }) {
  const { status, data, error } = request;

  if (status === 'error') {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (!data || (status === 'loading' && data.items.length === 0)) {
    return <Loader label="Loading books…" />;
  }

  if (data.items.length === 0) {
    return hasFilters ? (
      <EmptyState
        title="No books match your search"
        text="Try a different keyword or loosen the filters."
        actionLabel="Clear search and filters"
        onAction={onClearFilters}
      />
    ) : (
      <EmptyState title="The catalogue is empty" text="Use “Add book” to create the first record." />
    );
  }

  const isRefreshing = status === 'loading';
  return (
    <div className={`results${isRefreshing ? ' is-refreshing' : ''}`} aria-busy={isRefreshing}>
      <BookList
        books={data.items}
        onOpen={onOpen}
        onToggleFavorite={onToggleFavorite}
        pendingFavoriteId={pendingFavoriteId}
      />
    </div>
  );
}
