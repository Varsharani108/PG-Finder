const OPTIONS = ["Food included", "Breakfast", "Lunch", "Dinner", "Vegetarian", "Non-vegetarian"];

export default function FoodFilter({ value, onChange }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };

  return (
    <div>
      <label className="text-sm font-medium">Food</label>
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
