import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://api.sampleapis.com/movies/classic",
        );

        if (!response.ok) {
          throw new Error("The catalog could not be loaded right now.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "The movie catalog is unavailable in the expected format.",
          );
        }

        if (isMounted) {
          setMovies(data);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError.message || "Something went wrong while loading movies.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredMovies = movies.filter((movie) => {
    const title = (movie.title || "Untitled film").toLowerCase();
    return title.includes(normalizedSearch);
  });

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">Curated classics</p>
          <h1>Sigmax</h1>
        </div>

        <div className="header-controls">
          <label className="search-field" htmlFor="movie-search">
            <span>Search</span>
            <input
              id="movie-search"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title..."
              aria-label="Search movies by title"
            />
          </label>

          <span className="collection-count">
            {filteredMovies.length} titles
          </span>
        </div>
      </header>

      {isLoading && (
        <div className="status-card loading" role="status">
          Loading movie collection...
        </div>
      )}

      {error && (
        <div className="status-card error" role="alert">
          {error}
        </div>
      )}

      {!isLoading && !error && movies.length === 0 && (
        <div className="status-card empty">No movies available right now.</div>
      )}

      {!isLoading &&
        !error &&
        movies.length > 0 &&
        filteredMovies.length === 0 && (
          <div className="status-card empty">
            No movies match “{searchTerm}”.
          </div>
        )}

      {!isLoading && !error && filteredMovies.length > 0 && (
        <main className="movie-grid">
          {filteredMovies.map((movie, index) => {
            const posterUrl =
              movie.posterURL || movie.posterUrl || movie.poster || movie.image;
            const title = movie.title || "Untitled film";
            const year = movie.year || movie.releaseYear || "Unknown year";

            return (
              <article className="movie-card" key={`${title}-${index}`}>
                {posterUrl ? (
                  <>
                    <img
                      src={posterUrl}
                      alt={`${title} poster`}
                      className="movie-poster"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        const fallback = event.currentTarget.nextElementSibling;
                        if (fallback) {
                          fallback.style.display = "flex";
                        }
                      }}
                    />
                    <div
                      className="poster-fallback"
                      aria-label={`${title} poster unavailable`}
                    >
                      No poster available
                    </div>
                  </>
                ) : (
                  <div
                    className="poster-fallback visible"
                    aria-label={`${title} poster unavailable`}
                  >
                    No poster available
                  </div>
                )}

                <div className="movie-details">
                  <h2>{title}</h2>
                  <p>{year}</p>
                </div>
              </article>
            );
          })}
        </main>
      )}
    </div>
  );
}

export default App;
