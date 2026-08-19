export default function SortDropdown({ value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium">Sort</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-2 py-2 rounded border bg-white"
      >
        <option value="recommended">Recommended</option>
        <option value="lowest">Lowest price</option>
        <option value="highest_rating">Highest rating</option>
        <option value="nearest">Nearest</option>
        <option value="most_reviewed">Most reviewed</option>
      </select>
    </div>
  );
}
