const OPTIONS = [
  { id: "single", label: "Single sharing" },
  { id: "double", label: "Double sharing" },
  { id: "triple", label: "Triple sharing" },
  { id: "4+", label: "4+ sharing" },
];

export default function RoomTypeFilter({ value, onChange }) {
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  return (
    <div>
      <label className="text-sm font-medium">Room Type</label>
      <div className="mt-1 space-y-1">
        {OPTIONS.map((o) => (
          <label key={o.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.includes(o.id)}
              onChange={() => toggle(o.id)}
            />
            <span className="text-sm">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
