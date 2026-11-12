export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <span className="header__logo" aria-hidden="true">
          📚
        </span>
        <div>
          <h1 className="header__title">Bookshelf</h1>
          <p className="header__tagline">Browse, search and manage the library catalogue</p>
        </div>
      </div>
    </header>
  );
}
