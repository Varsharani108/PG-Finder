export default function BudgetFilter({ value, onChange }) {
  const setMin = (v) => onChange({ ...value, min: v });
  const setMax = (v) => onChange({ ...value, max: v });

  return (
    <div>
      <label className="text-sm font-medium">Budget (₹)</label>
      <div className="flex gap-2 mt-1">
        <input
          type="number"
          value={value.min}
          onChange={(e) => setMin(e.target.value)}
          placeholder="Min"
          className="w-1/2 px-2 py-2 rounded border bg-white"
        />
        <input
          type="number"
          value={value.max}
          onChange={(e) => setMax(e.target.value)}
          placeholder="Max"
          className="w-1/2 px-2 py-2 rounded border bg-white"
        />
      </div>
    </div>
  );
}
