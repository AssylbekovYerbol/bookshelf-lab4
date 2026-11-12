# 📚 Bookshelf — React SPA (Task 4: Async React — Effects & API)

A library catalogue built with **React 18 + Vite**. Browse 120 books, search, filter, sort, paginate, open a detail view, create / edit / delete books and manage availability — all through a simulated asynchronous API.

**Live demo:** _add your deployed link here_
**Repository:** _add your GitHub link here_

## Data source

The app uses the **simulated asynchronous API** (`src/api/booksApi.js`):

- every function returns a `Promise` and waits 350–800 ms like a real network call;
- data is stored in `localStorage`; on the first visit **120 books** are generated (15 per genre, deterministic seed in `src/data/seed.js`);
- requests accept an `AbortSignal`, so React effects can cancel outdated requests;
- add `?simulateError` to the URL (for example `https://your-site/?simulateError`) to make every request fail and see the error state.

## Features

| Requirement | Where |
| --- | --- |
| List view | `BookResults` → `BookList` → `BookCard` |
| Detail view | `BookDetail` (opens in place of the list; filters and page are kept) |
| Create / Edit | `AddBookForm` (controlled form, reused for creating and editing; validation, server error, pending state) |
| Remove | `BookDetail` → Delete book |
| Details (10 fields, extra ones loaded by `getBook` only) | `BookDetail` (publisher, edition, language, ISBN, reviews + genre, year, pages, reading time, added) |
| Reload | “↻ Reload” button in the catalogue toolbar |
| Search | `SearchBar` (updates on every keystroke, no debounce; searches title, author and description) |
| Filtering | genre, availability, minimum rating, favourites only (`FilterPanel`) |
| Sorting | `SORT_OPTIONS` (title, year, rating, recently added) |
| Pagination | `Pagination` + server-side paging in the API (12 per page) |
| Loading / error / empty / success | `BookResults`, `Loader`, `ErrorMessage`, `EmptyState` |
| Reusable components | 18 components in `src/components` |

Extra behaviour: favourites, change availability, delete a book, "You may also like" block, toast messages, reset demo data.

## React concepts used

Only `useState` and `useEffect` are used (no other hooks, no custom hooks, no debouncing, no fetching libraries).
Components never touch `localStorage`; it is accessed only inside `src/api/booksApi.js`.

- `useEffect` with correct dependency arrays and cleanup:
  - `BooksPage` refetches when `[filters, page, reloadKey]` change. The cleanup calls `controller.abort()`, so the previous request is cancelled.
  - `BookDetail` loads the book (with extra detail fields) and related books when `[bookId, retryKey]` change, with the same abort cleanup.
  - `BooksPage` auto-dismisses the toast with `setTimeout` and `clearTimeout` in cleanup (`[toast]`).
- **Race conditions:** every request carries an `AbortSignal`; the effect cleanup aborts it when the query changes or the component unmounts, and aborted requests are ignored (`AbortError`). Typing quickly in the search box or switching between books never shows outdated data. `<BookDetail key={selectedId}>` additionally gives every book a fresh component instance.
- **Stale closures:** before an action starts (`handleToggleFavorite`, status change, edit, delete) the book's `id` is captured in a local constant and used for the request and for applying the response, so the answer always updates the correct book. Conflicting actions are prevented: while an action is running (`busy` / `pendingFavoriteId`) all related controls are disabled.
- State is updated immutably (`{ ...prev, [name]: value }`, `map`, `filter`). Stable keys (`book.id`) in lists.
- Add `?simulateError` to the URL to see the error state.

## Project structure

```
src/
├── api/booksApi.js        simulated API (Promises, delays, localStorage, AbortSignal)
├── data/seed.js           generator for the 120 initial books
├── constants.js           genres, statuses, sort options, defaults
├── pages/BooksPage.jsx    catalogue screen: query state, effects, handlers, toast timer
├── components/            reusable UI components
├── App.jsx, main.jsx
└── styles.css             responsive styles
```

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the production build
```

## Deploy

The build is a static site (`dist/`) and uses `base: './'`, so it works on any static host.

**Vercel / Netlify (easiest)** — import the GitHub repository, framework preset *Vite*, build command `npm run build`, output directory `dist`.

**GitHub Pages** — this repo contains `.github/workflows/deploy.yml`. In the repository go to *Settings → Pages → Source: GitHub Actions*, push to `main`, and the site is published at `https://<user>.github.io/<repo>/`.
