export default function ClearFilters({ onClear }) {
  return (
    <div className="mt-2">
      <button onClick={onClear} className="btn-clear-danger">
        Clear All Filters
      </button>
    </div>
  );
}
