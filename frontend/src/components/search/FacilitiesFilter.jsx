const OPTIONS = [
  "Wi-Fi",
  "AC",
  "Attached bathroom",
  "Furniture",
  "Washing machine",
  "Parking",
  "Power backup",
  "Study table",
  "Gym",
];

export default function FacilitiesFilter({ value, onChange }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };

  return (
    <div>
      <label className="text-sm font-medium">Facilities</label>
      <div className="mt-1 grid grid-cols-2 gap-1">
        {OPTIONS.map((o) => (
          <label key={o} className="flex items-center gap-2">
            <input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} />
            <span className="text-sm">{o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
