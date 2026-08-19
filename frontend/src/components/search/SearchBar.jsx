export default function SearchBar({ query, setQuery }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by city, area, college or office"
        className="search-input"
      />
      <button onClick={() => setQuery("")} className="btn-clear">
        Clear
      </button>
    </div>
  );
}
