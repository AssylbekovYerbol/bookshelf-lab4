import { useState } from 'react';
import { GENRES, STATUSES } from '../constants';
import FormField from './FormField.jsx';
import SelectField from './SelectField.jsx';

const EMPTY_BOOK_VALUES = {
  title: '',
  author: '',
  genre: GENRES[0],
  year: '',
  pages: '',
  rating: '',
  status: 'available',
  description: '',
};

const GENRE_OPTIONS = GENRES.map((genre) => ({ value: genre, label: genre }));

function validate(values) {
  const errors = {};
  const currentYear = new Date().getFullYear();
  const title = values.title.trim();
  const author = values.author.trim();
  const year = Number(values.year);
  const pages = Number(values.pages);
  const rating = Number(values.rating);

  if (title.length < 2) errors.title = 'Enter a title (at least 2 characters).';
  else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer.';

  if (author.length < 2) errors.author = 'Enter the author’s name.';
  else if (author.length > 80) errors.author = 'Author must be 80 characters or fewer.';

  if (values.year === '' || !Number.isInteger(year) || year < 1000 || year > currentYear) {
    errors.year = `Enter a year between 1000 and ${currentYear}.`;
  }
  if (values.pages === '' || !Number.isInteger(pages) || pages < 1 || pages > 5000) {
    errors.pages = 'Enter a page count between 1 and 5000.';
  }
  if (values.rating === '' || Number.isNaN(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Enter a rating between 1 and 5.';
  }
  if (values.description.length > 500) errors.description = 'Description must be 500 characters or fewer.';

  return errors;
}

/**
 * Controlled form used for both creating and editing a book: every input's value comes from
 * `values` state and every change goes through handleChange. State is updated immutably.
 * Pass `initialValues` to edit an existing book; leave it out to create a new one.
 */
export default function AddBookForm({
  onSubmit,
  onCancel,
  initialValues,
  heading = 'Add a new book',
  submitLabel = 'Add book',
}) {
  const isEdit = Boolean(initialValues);
  const startValues = isEdit
    ? {
        title: initialValues.title,
        author: initialValues.author,
        genre: initialValues.genre,
        year: String(initialValues.year),
        pages: String(initialValues.pages),
        rating: String(initialValues.rating),
        status: initialValues.status,
        description: initialValues.description ?? '',
      }
    : EMPTY_BOOK_VALUES;
  const [values, setValues] = useState(startValues);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const errors = validate(values);
  const showError = (name) => (touched[name] ? errors[name] : undefined);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleReset() {
    setValues(startValues);
    setTouched({});
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // reveal every error at once if the user pressed "Add" without touching some fields
    setTouched(Object.fromEntries(Object.keys(EMPTY_BOOK_VALUES).map((name) => [name, true])));
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        author: values.author.trim(),
        year: Number(values.year),
        pages: Number(values.pages),
        rating: Number(values.rating),
        description: values.description.trim(),
      });
      // on success the parent closes (unmounts) the form
    } catch (error) {
      setSubmitError(error.message);
      setSubmitting(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <h2 className="panel__title">{heading}</h2>

      <div className="form__grid">
        <FormField id="book-title" label="Title" error={showError('title')}>
          <input
            id="book-title"
            name="title"
            className="input"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(showError('title'))}
            aria-describedby={showError('title') ? 'book-title-error' : undefined}
          />
        </FormField>

        <FormField id="book-author" label="Author" error={showError('author')}>
          <input
            id="book-author"
            name="author"
            className="input"
            value={values.author}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(showError('author'))}
            aria-describedby={showError('author') ? 'book-author-error' : undefined}
          />
        </FormField>

        <SelectField
          id="book-genre"
          name="genre"
          label="Genre"
          value={values.genre}
          onChange={handleChange}
          options={GENRE_OPTIONS}
        />

        <SelectField
          id="book-status"
          name="status"
          label="Availability"
          value={values.status}
          onChange={handleChange}
          options={STATUSES}
        />

        <FormField id="book-year" label="Year" error={showError('year')}>
          <input
            id="book-year"
            name="year"
            type="number"
            inputMode="numeric"
            className="input"
            value={values.year}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(showError('year'))}
            aria-describedby={showError('year') ? 'book-year-error' : undefined}
          />
        </FormField>

        <FormField id="book-pages" label="Pages" error={showError('pages')}>
          <input
            id="book-pages"
            name="pages"
            type="number"
            inputMode="numeric"
            className="input"
            value={values.pages}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(showError('pages'))}
            aria-describedby={showError('pages') ? 'book-pages-error' : undefined}
          />
        </FormField>

        <FormField id="book-rating" label="Rating (1–5)" error={showError('rating')}>
          <input
            id="book-rating"
            name="rating"
            type="number"
            step="0.1"
            inputMode="decimal"
            className="input"
            value={values.rating}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(showError('rating'))}
            aria-describedby={showError('rating') ? 'book-rating-error' : undefined}
          />
        </FormField>
      </div>

      <FormField
        id="book-description"
        label="Description"
        error={showError('description')}
        hint={`${values.description.length}/500`}
      >
        <textarea
          id="book-description"
          name="description"
          rows={3}
          className="input"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(showError('description'))}
          aria-describedby={showError('description') ? 'book-description-error' : undefined}
        />
      </FormField>

      {submitError && (
        <p className="form__error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form__actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleReset} disabled={submitting}>
          {isEdit ? 'Reset changes' : 'Clear form'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
