const OPTIONS = [
  { id: "500", label: "Within 500 m" },
  { id: "1000", label: "Within 1 km" },
  { id: "2000", label: "Within 2 km" },
  { id: "5000", label: "Within 5 km" },
];

export default function DistanceFilter({ value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium">Distance</label>
      <div className="mt-1 space-y-1">
        {OPTIONS.map((o) => (
          <label key={o.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="distance"
              checked={value === o.id}
              onChange={() => onChange(o.id)}
            />
            <span className="text-sm">{o.label}</span>
          </label>
        ))}
        <label className="flex items-center gap-2">
          <input type="radio" name="distance" checked={!value} onChange={() => onChange(null)} />
          <span className="text-sm">Any</span>
        </label>
      </div>
    </div>
  );
}
