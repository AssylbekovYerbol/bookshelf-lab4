import { useEffect, useState } from 'react';
import { addBook, getBooks, resetBooks, updateBook } from '../api/booksApi';
import { DEFAULT_FILTERS, PAGE_SIZE, SORT_OPTIONS } from '../constants';
import AddBookForm from '../components/AddBookForm.jsx';
import BookDetail from '../components/BookDetail.jsx';
import BookResults from '../components/BookResults.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SelectField from '../components/SelectField.jsx';
import Toast from '../components/Toast.jsx';

function hasActiveFilters(filters) {
  return (
    filters.search.trim() !== '' ||
    filters.genre !== DEFAULT_FILTERS.genre ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.minRating !== DEFAULT_FILTERS.minRating ||
    filters.favoritesOnly !== DEFAULT_FILTERS.favoritesOnly
  );
}

/**
 * Owns everything that belongs to the catalogue screen:
 * query state (filters + page), request state, which book is open, form visibility, toast.
 */
export default function BooksPage() {
  // --- query state: changing any of these triggers a new request -------------------------
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0); // bump to force a refetch with the same query

  // --- request state ----------------------------------------------------------------------
  const [request, setRequest] = useState({ status: 'loading', data: null, error: null });

  // --- UI state ---------------------------------------------------------------------------
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingFavoriteId, setPendingFavoriteId] = useState(null); // book whose favourite toggle is in flight

  // Fetch the current page. Re-runs whenever the query changes.
  // Cleanup aborts the previous request, so a slow old response can never overwrite a newer one.
  useEffect(() => {
    const controller = new AbortController();
    setRequest((prev) => ({ ...prev, status: 'loading', error: null }));

    getBooks({ ...filters, page, pageSize: PAGE_SIZE }, { signal: controller.signal })
      .then((data) => setRequest({ status: 'success', data, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return; // request was superseded
        setRequest((prev) => ({ ...prev, status: 'error', error: error.message }));
      });

    return () => controller.abort();
  }, [filters, page, reloadKey]);

  // Auto-dismiss the toast. A new toast object restarts the timer; cleanup clears the old one.
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message, tone = 'success') {
    setToast({ message, tone });
  }

  // Any filter/sort change goes back to page 1; state is replaced immutably.
  function updateFilter(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }

  function handleResetFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- list actions -----------------------------------------------------------------------
  async function handleToggleFavorite(book) {
    if (pendingFavoriteId !== null) return; // one favourite toggle at a time
    const bookId = book.id; // captured now: the response below must update exactly this book
    setPendingFavoriteId(bookId);
    try {
      const updated = await updateBook(bookId, { favorite: !book.favorite });
      setRequest((prev) =>
        prev.data
          ? {
              ...prev,
              data: { ...prev.data, items: prev.data.items.map((item) => (item.id === bookId ? updated : item)) },
            }
          : prev,
      );
      if (filters.favoritesOnly) setReloadKey((key) => key + 1);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setPendingFavoriteId(null);
    }
  }

  async function handleAddBook(values) {
    const book = await addBook(values); // errors bubble up to the form, which shows them
    // show the new book: default filters, newest first, page 1
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setReloadKey((key) => key + 1);
    setShowForm(false);
    showToast(`“${book.title}” was added to the catalogue.`);
  }

  async function handleResetData() {
    if (!window.confirm('Restore the original 120 demo books? Your changes will be lost.')) return;
    try {
      await resetBooks();
      setSelectedId(null);
      handleResetFilters();
      setReloadKey((key) => key + 1);
      showToast('Demo data restored.');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  // --- detail actions ---------------------------------------------------------------------
  function handleCloseDetail() {
    setSelectedId(null);
    setReloadKey((key) => key + 1); // the book may have been changed in the detail view
  }

  function handleDeleted(book) {
    // if the deleted book was the last one on this page, step back one page
    if (request.data && request.data.items.length === 1 && page > 1) setPage((p) => p - 1);
    setSelectedId(null);
    setReloadKey((key) => key + 1);
    showToast(`“${book.title}” was deleted.`);
  }

  const toastView = toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />;

  if (selectedId !== null) {
    return (
      <>
        <BookDetail
          key={selectedId}
          bookId={selectedId}
          onBack={handleCloseDetail}
          onOpen={setSelectedId}
          onDeleted={handleDeleted}
        />
        {toastView}
      </>
    );
  }

  const { data } = request;
  const filtersActive = hasActiveFilters(filters);
  const firstItem = data && data.total > 0 ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastItem = data ? Math.min(data.page * data.pageSize, data.total) : 0;

  return (
    <>
      <div className="toolbar">
        <h2 className="toolbar__title">Catalogue</h2>
        <div className="toolbar__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={request.status === 'loading'}
          >
            {request.status === 'loading' ? 'Loading…' : '↻ Reload'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={handleResetData}>
            Reset demo data
          </button>
          <button type="button" className="btn" onClick={() => setShowForm((open) => !open)} aria-expanded={showForm}>
            {showForm ? 'Close form' : '+ Add book'}
          </button>
        </div>
      </div>

      {showForm && <AddBookForm onSubmit={handleAddBook} onCancel={() => setShowForm(false)} />}

      <section className="panel controls" aria-label="Search and filters">
        <SearchBar value={filters.search} onChange={(value) => updateFilter('search', value)} />
        <FilterPanel
          filters={filters}
          onChange={updateFilter}
          onReset={handleResetFilters}
          canReset={filtersActive}
        />
      </section>

      <div className="results-bar">
        <p className="results-bar__count" aria-live="polite">
          {data
            ? data.total > 0
              ? `Showing ${firstItem}–${lastItem} of ${data.total} books`
              : '0 books found'
            : 'Loading…'}
        </p>
        <div className="results-bar__sort">
          <SelectField
            id="sort"
            label="Sort by"
            value={filters.sort}
            onChange={(event) => updateFilter('sort', event.target.value)}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      <BookResults
        request={request}
        hasFilters={filtersActive}
        onRetry={() => setReloadKey((key) => key + 1)}
        onClearFilters={handleResetFilters}
        onOpen={setSelectedId}
        onToggleFavorite={handleToggleFavorite}
        pendingFavoriteId={pendingFavoriteId}
      />

      {data && request.status !== 'error' && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
          disabled={request.status === 'loading'}
        />
      )}

      {toastView}
    </>
  );
}
