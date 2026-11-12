/** Presentational message. The parent owns the auto-dismiss timer (see BooksPage). */
export default function Toast({ message, tone = 'success', onClose }) {
  return (
    <div className={`toast toast--${tone}`} role="status">
      <span>{message}</span>
      <button type="button" className="toast__close" onClick={onClose} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}
