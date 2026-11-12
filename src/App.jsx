import Header from './components/Header.jsx';
import BooksPage from './pages/BooksPage.jsx';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="container">
        <BooksPage />
      </main>
      <footer className="footer">
        <p>Bookshelf · React midterm project · data is simulated and stored in your browser.</p>
      </footer>
    </div>
  );
}
