export default function RatingStars({ value }) {
  const filled = Math.round(value);
  return (
    <span className="rating" role="img" aria-label={`Rating ${value.toFixed(1)} out of 5`}>
      <span className="rating__stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= filled ? 'is-filled' : ''}>
            ★
          </span>
        ))}
      </span>
      <span className="rating__value">{value.toFixed(1)}</span>
    </span>
  );
}
