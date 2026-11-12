/** Returns e.g. [1, '…', 4, 5, 6, '…', 10] for a compact page list. */
function getPageItems(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) items.push(`gap-${p}`);
    items.push(p);
  });
  return items;
}

export default function Pagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page === 1}
      >
        ← Prev
      </button>
      <ul className="pagination__list">
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'string' ? (
            <li key={item} className="pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={`page-btn${item === page ? ' is-current' : ''}`}
                onClick={() => onPageChange(item)}
                disabled={disabled}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className="btn btn--ghost"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page === totalPages}
      >
        Next →
      </button>
    </nav>
  );
}
