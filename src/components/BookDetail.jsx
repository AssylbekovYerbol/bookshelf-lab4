import { useEffect, useState } from 'react';
import { deleteBook, getBook, getRelatedBooks, updateBook } from '../api/booksApi';
import { STATUSES } from '../constants';
import AddBookForm from './AddBookForm.jsx';
import BookCover from './BookCover.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import Loader from './Loader.jsx';
import RatingStars from './RatingStars.jsx';
import SelectField from './SelectField.jsx';
import StatusBadge from './StatusBadge.jsx';

function formatReadingTime(pages) {
  const minutes = pages * 2; // ~2 minutes per page
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} h ${rest} min`;
}

/**
 * Detail view. The parent renders it with key={bookId}, so choosing another book
 * (e.g. from "You may also like") unmounts this instance and mounts a fresh one:
 * all local state is reset automatically.
 */
export default function BookDetail({ bookId, onBack, onOpen, onDeleted }) {
  const [state, setState] = useState({ status: 'loading', book: null, related: [], error: null });
  const [retryKey, setRetryKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    Promise.all([
      getBook(bookId, { signal: controller.signal }),
      getRelatedBooks(bookId, { signal: controller.signal }),
    ])
      .then(([book, related]) => setState({ status: 'success', book, related, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return; // cancelled by cleanup, ignore
        setState((prev) => ({ ...prev, status: 'error', error: error.message }));
      });

    return () => controller.abort();
  }, [bookId, retryKey]);

  /**
   * Runs one update/delete action. Only one action can be in flight at a time (`busy` also
   * disables every control), and the book id is captured by the caller BEFORE the request
   * starts, so the response can only ever be applied to the book the action was started for.
   */
  async function runAction(action) {
    if (busy) return undefined;
    setBusy(true);
    setActionError('');
    try {
      return await action();
    } catch (error) {
      setActionError(error.message);
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  // Merge the server's answer into the loaded details (they have extra fields the update response lacks),
  // but only if the screen still shows the book the request was made for.
  function applyUpdate(id, updated) {
    setState((prev) => (prev.book && prev.book.id === id ? { ...prev, book: { ...prev.book, ...updated } } : prev));
  }

  function handleToggleFavorite() {
    const id = state.book.id;
    const favorite = !state.book.favorite;
    return runAction(async () => {
      applyUpdate(id, await updateBook(id, { favorite }));
    });
  }

  function handleStatusChange(event) {
    const id = state.book.id;
    const status = event.target.value;
    return runAction(async () => {
      applyUpdate(id, await updateBook(id, { status }));
    });
  }

  function handleSaveEdit(values) {
    // used by the edit form, which shows the error itself, so errors must bubble up (no runAction)
    const id = state.book.id;
    return updateBook(id, values).then((updated) => {
      applyUpdate(id, updated);
      setEditing(false);
    });
  }

  function handleDelete() {
    const book = state.book; // captured: the confirm dialog and the request refer to this exact book
    if (!window.confirm(`Delete “${book.title}” from the catalogue?`)) return undefined;
    return runAction(async () => {
      await deleteBook(book.id);
      onDeleted(book);
    });
  }

  const backButton = (
    <button type="button" className="btn btn--ghost" onClick={onBack}>
      ← Back to catalogue
    </button>
  );

  if (state.status === 'loading' && !state.book) {
    return (
      <section>
        {backButton}
        <Loader label="Loading book details…" />
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section>
        {backButton}
        <ErrorMessage message={state.error} onRetry={() => setRetryKey((key) => key + 1)} />
      </section>
    );
  }

  const { book, related } = state;

  return (
    <section className="detail">
      {backButton}

      <div className="panel detail__main">
        <BookCover book={book} size="lg" />

        <div className="detail__info">
          <h2 className="detail__title">{book.title}</h2>
          <p className="detail__author">by {book.author}</p>

          <div className="detail__badges">
            <RatingStars value={book.rating} />
            <StatusBadge status={book.status} />
          </div>

          <dl className="facts">
            <div>
              <dt>Genre</dt>
              <dd>{book.genre}</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>{book.year}</dd>
            </div>
            <div>
              <dt>Pages</dt>
              <dd>{book.pages}</dd>
            </div>
            <div>
              <dt>Reading time</dt>
              <dd>≈ {formatReadingTime(book.pages)}</dd>
            </div>
            <div>
              <dt>Added</dt>
              <dd>{new Date(book.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
            </div>
            <div>
              <dt>Publisher</dt>
              <dd>{book.publisher}</dd>
            </div>
            <div>
              <dt>Edition</dt>
              <dd>{book.edition}</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>{book.language}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{book.isbn}</dd>
            </div>
            <div>
              <dt>Reviews</dt>
              <dd>{book.reviewsCount}</dd>
            </div>
          </dl>

          <p className="detail__description">{book.description || 'No description yet.'}</p>

          <div className="detail__actions">
            <SelectField
              id="detail-status"
              label="Availability"
              value={book.status}
              onChange={handleStatusChange}
              options={STATUSES}
              disabled={busy || editing}
            />
            <button type="button" className="btn" onClick={() => setEditing(true)} disabled={busy || editing}>
              Edit book
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleToggleFavorite} disabled={busy || editing}>
              {book.favorite ? '♥ Remove from favourites' : '♡ Add to favourites'}
            </button>
            <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={busy || editing}>
              Delete book
            </button>
          </div>

          {actionError && (
            <p className="form__error" role="alert">
              {actionError}
            </p>
          )}
        </div>
      </div>

      {editing && (
        <AddBookForm
          initialValues={book}
          heading="Edit book"
          submitLabel="Save changes"
          onSubmit={handleSaveEdit}
          onCancel={() => setEditing(false)}
        />
      )}

      {related.length > 0 && (
        <div className="related">
          <h3>You may also like</h3>
          <ul className="related__list">
            {related.map((item) => (
              <li key={item.id}>
                <button type="button" className="related__item" onClick={() => onOpen(item.id)}>
                  <BookCover book={item} size="sm" />
                  <span className="related__text">
                    <strong>{item.title}</strong>
                    <span>{item.author}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
