import { useState, useEffect } from "react";
import AddFavourite from "./components/AddFavourites";
import RemoveFavourites from "./components/RemoveFavourites";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [favourites, setFavourites] = useState(() => {
    try {
      const saved = localStorage.getItem("sigmax-favourites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activePage, setActivePage] = useState("home");

  const API_KEY = "1afe58e3";

  useEffect(() => {
    localStorage.setItem("sigmax-favourites", JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    const searchMovies = async (movieTitle) => {
      if (!movieTitle) {
        setMovies([]);
        setError("");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&s=${movieTitle}`,
        );
        const data = await response.json();

        const filteredMovies = data.Search?.filter((movie) =>
          movie.Title.toLowerCase().includes(movieTitle.toLowerCase()),
        );

        if (filteredMovies.length === 0) {
          setMovies([]);
          setError("No movies found.");
        } else {
          setMovies(filteredMovies);
          setError("");
        }
      } catch {
        setError("An error occurred while fetching movies.");
      }

      setLoading(false);
    };

    searchMovies(query);
  }, [query]);

  const isFavourite = (movie) =>
    favourites.some(
      (item) => (item.imdbID || item.Title) === (movie.imdbID || movie.Title),
    );

  const toggleFavourite = (movie) => {
    const movieKey = movie.imdbID || movie.Title;

    setFavourites((currentFavourites) => {
      const exists = currentFavourites.some(
        (item) => (item.imdbID || item.Title) === movieKey,
      );

      if (exists) {
        return currentFavourites.filter(
          (item) => (item.imdbID || item.Title) !== movieKey,
        );
      }

      return [...currentFavourites, movie];
    });
  };

  const renderHomePage = () => (
    <>
      <div className="search-wrap">
        <input
          type="text"
          placeholder="Type in movie title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <h2>Loading...</h2>}
      {error && <h2>{error}</h2>}

      {!loading && !error && query.trim() && (
        <div className="results-summary">
          <span>
            {movies.length} movie{movies.length === 1 ? "" : "s"} displayed
          </span>
        </div>
      )}

      <div className="movie-list">
        {movies.map((movie) => {
          const fav = isFavourite(movie);

          return (
            <div className="card" key={movie.imdbID || movie.Title}>
              <img
                src={
                  movie.Poster && movie.Poster !== "N/A"
                    ? movie.Poster
                    : "https://via.placeholder.com/250x350?text=No+Image"
                }
                alt={movie.Title}
              />
              <h3>{movie.Title}</h3>

              <div className="card-actions">
                {fav ? (
                  <RemoveFavourites
                    movie={movie}
                    onClick={() => toggleFavourite(movie)}
                  />
                ) : (
                  <AddFavourite
                    movie={movie}
                    onClick={() => toggleFavourite(movie)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderFavouritesPage = () => (
    <div className="favourites-page">
      <h2>Your Favourites</h2>

      {favourites.length === 0 ? (
        <p className="empty-state">No favourite movies yet.</p>
      ) : (
        <div className="movie-list">
          {favourites.map((movie) => (
            <div className="card" key={movie.imdbID || movie.Title}>
              <img
                src={
                  movie.Poster && movie.Poster !== "N/A"
                    ? movie.Poster
                    : "https://via.placeholder.com/250x350?text=No+Image"
                }
                alt={movie.Title}
              />
              <h3>{movie.Title}</h3>

              <div className="card-actions">
                <RemoveFavourites
                  movie={movie}
                  onClick={() => toggleFavourite(movie)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
      <div className="top-bar">
        <img src="/sigmax.jpg" alt="Sigmax logo" className="app-logo" />
      </div>

      <nav className="nav-bar" aria-label="Main navigation">
        <button
          type="button"
          className={activePage === "home" ? "nav-button active" : "nav-button"}
          onClick={() => setActivePage("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={
            activePage === "favourites" ? "nav-button active" : "nav-button"
          }
          onClick={() => setActivePage("favourites")}
        >
          Favourites
        </button>
      </nav>

      {activePage === "home" ? renderHomePage() : renderFavouritesPage()}
    </div>
  );
}

export default App;
