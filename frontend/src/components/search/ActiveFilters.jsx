export default function ActiveFilters({ filters, onRemove }) {
  const parts = [];
  if (filters.search) parts.push({ label: filters.search, key: "search" });
  if (filters.budget.min || filters.budget.max) parts.push({ label: `₹${filters.budget.min || "0"}–₹${filters.budget.max || "∞"}`, key: "budget" });
  parts.push(...filters.roomTypes.map((value) => ({ label: `${value} sharing`, key: `roomType:${value}` })));
  parts.push(...filters.facilities.map((value) => ({ label: value, key: `facility:${value}` })));
  parts.push(...filters.food.map((value) => ({ label: value, key: `food:${value}` })));
  if (filters.distance) parts.push({ label: `Within ${filters.distance} m`, key: "distance" });

  if (!parts.length) return <div className="text-sm muted">No active filters</div>;

  return (
    <div className="flex flex-wrap gap-2">
      {parts.map((part) => (
        <button key={part.key} type="button" onClick={() => onRemove?.(part.key)} className="filter-badge">
          {part.label} ×
        </button>
      ))}
    </div>
  );
}
