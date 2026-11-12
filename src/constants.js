export const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'History',
  'Science',
  'Biography',
  'Technology',
];

export const STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'borrowed', label: 'Borrowed' },
  { value: 'reserved', label: 'Reserved' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Recently added' },
  { value: 'title-asc', label: 'Title A → Z' },
  { value: 'title-desc', label: 'Title Z → A' },
  { value: 'year-desc', label: 'Year: newest first' },
  { value: 'year-asc', label: 'Year: oldest first' },
  { value: 'rating-desc', label: 'Top rated' },
];

export const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 3, label: '3.0 and up' },
  { value: 3.5, label: '3.5 and up' },
  { value: 4, label: '4.0 and up' },
  { value: 4.5, label: '4.5 and up' },
];

// Hue (0–360) used to colour the generated book covers per genre.
export const GENRE_HUES = {
  Fantasy: 268,
  'Science Fiction': 205,
  Mystery: 345,
  Romance: 320,
  History: 28,
  Science: 160,
  Biography: 45,
  Technology: 225,
};

export const PAGE_SIZE = 12;

export const DEFAULT_FILTERS = {
  search: '',
  genre: 'all',
  status: 'all',
  minRating: 0,
  favoritesOnly: false,
  sort: 'newest',
};
