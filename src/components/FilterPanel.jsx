import { GENRES, RATING_OPTIONS, STATUSES } from '../constants';
import SelectField from './SelectField.jsx';

const GENRE_OPTIONS = [{ value: 'all', label: 'All genres' }, ...GENRES.map((genre) => ({ value: genre, label: genre }))];
const STATUS_OPTIONS = [{ value: 'all', label: 'Any status' }, ...STATUSES];

export default function FilterPanel({ filters, onChange, onReset, canReset }) {
  return (
    <div className="filters">
      <SelectField
        id="filter-genre"
        label="Genre"
        value={filters.genre}
        onChange={(event) => onChange('genre', event.target.value)}
        options={GENRE_OPTIONS}
      />
      <SelectField
        id="filter-status"
        label="Availability"
        value={filters.status}
        onChange={(event) => onChange('status', event.target.value)}
        options={STATUS_OPTIONS}
      />
      <SelectField
        id="filter-rating"
        label="Rating"
        value={filters.minRating}
        onChange={(event) => onChange('minRating', Number(event.target.value))}
        options={RATING_OPTIONS}
      />
      <label className="checkbox" htmlFor="filter-favorites">
        <input
          id="filter-favorites"
          type="checkbox"
          checked={filters.favoritesOnly}
          onChange={(event) => onChange('favoritesOnly', event.target.checked)}
        />
        Favourites only
      </label>
      <button type="button" className="btn btn--ghost" onClick={onReset} disabled={!canReset}>
        Reset filters
      </button>
    </div>
  );
}
