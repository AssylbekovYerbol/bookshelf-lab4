/**
 * Controlled search input. Every keystroke is passed straight to the parent (no debouncing);
 * superseded requests are cancelled by the AbortController cleanup in the parent's effect,
 * so a slow response to an old query can never overwrite the result of a newer one.
 */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="search">
      <label htmlFor="search" className="sr-only">
        Search books
      </label>
      <input
        id="search"
        type="search"
        className="input search__input"
        placeholder="Search by title, author or description…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" className="search__clear" onClick={() => onChange('')} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}
