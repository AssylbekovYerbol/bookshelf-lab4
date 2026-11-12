export default function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="state">
      <h3>{title}</h3>
      <p>{text}</p>
      {onAction && (
        <button type="button" className="btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
