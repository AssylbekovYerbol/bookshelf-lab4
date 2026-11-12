import { generateBooks } from '../data/seed';

/**
 * Simulated asynchronous API.
 * - returns Promises and waits a random 350–800 ms like a real network call
 * - persists data in localStorage (120 seeded records on first visit)
 * - supports AbortSignal, so React effects can cancel stale requests
 * - open the site with ?simulateError to make every request fail (to demo the error state)
 */

const STORAGE_KEY = 'bookshelf.books.v1';

function createAbortError() {
  return new DOMException('The request was aborted', 'AbortError');
}

function delay(signal) {
  const ms = 350 + Math.random() * 450;
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function failIfRequested() {
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('simulateError')) {
    throw new Error('Network error (simulated). Please try again.');
  }
}

function save(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // corrupted storage → fall through and reseed
  }
  const seeded = generateBooks();
  save(seeded);
  return seeded;
}

const PUBLISHERS = ['Northwind Press', 'Lakeshore Books', 'Orbit & Quill', 'Meridian House', 'Alder Street', 'Blue Heron'];
const LANGUAGES = ['English', 'English', 'English', 'Russian', 'Kazakh', 'German'];

/**
 * Details that exist only on the "detail" endpoint: the list never carries them,
 * so the detail view really has to load more data than the list card shows.
 * Derived deterministically from the id, so the same book always gets the same values.
 */
function extendDetails(book) {
  const n = Math.abs(book.id * 2654435761) >>> 0;
  const digits = String(1000000000 + (n % 9000000000)).padStart(10, '0');
  return {
    ...book,
    isbn: `978-${digits.slice(0, 1)}-${digits.slice(1, 6)}-${digits.slice(6, 9)}-${digits.slice(9)}`,
    publisher: PUBLISHERS[n % PUBLISHERS.length],
    language: LANGUAGES[(n >> 3) % LANGUAGES.length],
    edition: `${(n % 4) + 1}${['st', 'nd', 'rd', 'th'][n % 4]} edition`,
    reviewsCount: 20 + (n % 980),
  };
}

const SORTERS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  'title-asc': (a, b) => a.title.localeCompare(b.title) || a.id - b.id,
  'title-desc': (a, b) => b.title.localeCompare(a.title) || a.id - b.id,
  'year-desc': (a, b) => b.year - a.year || a.id - b.id,
  'year-asc': (a, b) => a.year - b.year || a.id - b.id,
  'rating-desc': (a, b) => b.rating - a.rating || a.id - b.id,
};

export async function getBooks(params = {}, { signal } = {}) {
  await delay(signal);
  failIfRequested();

  const {
    search = '',
    genre = 'all',
    status = 'all',
    minRating = 0,
    favoritesOnly = false,
    sort = 'newest',
    page = 1,
    pageSize = 12,
  } = params;

  const query = search.trim().toLowerCase();
  const filtered = load().filter((book) => {
    if (genre !== 'all' && book.genre !== genre) return false;
    if (status !== 'all' && book.status !== status) return false;
    if (book.rating < minRating) return false;
    if (favoritesOnly && !book.favorite) return false;
    if (query && !`${book.title} ${book.author} ${book.description}`.toLowerCase().includes(query)) return false;
    return true;
  });

  filtered.sort(SORTERS[sort] ?? SORTERS.newest);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

export async function getBook(id, { signal } = {}) {
  await delay(signal);
  failIfRequested();
  const book = load().find((item) => item.id === Number(id));
  if (!book) throw new Error('This book could not be found. It may have been removed.');
  return extendDetails(book);
}

/** Books from the same genre (same author first), used for the "You may also like" block. */
export async function getRelatedBooks(id, { signal, limit = 4 } = {}) {
  await delay(signal);
  failIfRequested();
  const books = load();
  const current = books.find((item) => item.id === Number(id));
  if (!current) return [];
  return books
    .filter((book) => book.id !== current.id && (book.genre === current.genre || book.author === current.author))
    .sort((a, b) => Number(b.author === current.author) - Number(a.author === current.author) || b.rating - a.rating)
    .slice(0, limit);
}

export async function addBook(data) {
  await delay();
  failIfRequested();
  const books = load();
  const title = String(data.title ?? '').trim();
  const author = String(data.author ?? '').trim();
  if (!title || !author) throw new Error('Title and author are required.');
  const duplicate = books.some(
    (book) => book.title.toLowerCase() === title.toLowerCase() && book.author.toLowerCase() === author.toLowerCase(),
  );
  if (duplicate) throw new Error('This book is already in the catalogue.');

  const book = {
    id: books.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    title,
    author,
    genre: data.genre,
    year: Number(data.year),
    pages: Number(data.pages),
    rating: Number(data.rating),
    status: data.status || 'available',
    description: String(data.description ?? '').trim(),
    favorite: false,
    createdAt: new Date().toISOString(),
  };
  save([book, ...books]);
  return book;
}

/**
 * Patches a book. Editable: title, author, genre, year, pages, rating, description, status, favorite.
 * `id` and `createdAt` can never change.
 */
export async function updateBook(id, patch) {
  await delay();
  failIfRequested();
  const books = load();
  const index = books.findIndex((book) => book.id === Number(id));
  if (index === -1) throw new Error('This book could not be found.');
  const current = books[index];

  const allowed = {};
  if ('favorite' in patch) allowed.favorite = Boolean(patch.favorite);
  if ('status' in patch) allowed.status = patch.status;
  if ('genre' in patch) allowed.genre = patch.genre;
  if ('year' in patch) allowed.year = Number(patch.year);
  if ('pages' in patch) allowed.pages = Number(patch.pages);
  if ('rating' in patch) allowed.rating = Number(patch.rating);
  if ('description' in patch) allowed.description = String(patch.description ?? '').trim();
  if ('title' in patch) allowed.title = String(patch.title ?? '').trim();
  if ('author' in patch) allowed.author = String(patch.author ?? '').trim();

  const updated = { ...current, ...allowed };
  if (!updated.title || !updated.author) throw new Error('Title and author are required.');
  const duplicate = books.some(
    (book) =>
      book.id !== current.id &&
      book.title.toLowerCase() === updated.title.toLowerCase() &&
      book.author.toLowerCase() === updated.author.toLowerCase(),
  );
  if (duplicate) throw new Error('Another book with this title and author already exists.');

  save(books.map((book, i) => (i === index ? updated : book)));
  return updated;
}

export async function deleteBook(id) {
  await delay();
  failIfRequested();
  const books = load();
  if (!books.some((book) => book.id === Number(id))) throw new Error('This book could not be found.');
  save(books.filter((book) => book.id !== Number(id)));
}

export async function resetBooks() {
  await delay();
  const seeded = generateBooks();
  save(seeded);
  return seeded.length;
}
