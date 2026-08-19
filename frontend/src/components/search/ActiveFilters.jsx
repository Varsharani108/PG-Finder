export default function ActiveFilters({ filters }) {
  const parts = [];
  if (filters.budget.min || filters.budget.max) {
    parts.push(`₹${filters.budget.min || "0"}–₹${filters.budget.max || "∞"}`);
  }
  if (filters.roomTypes.length) parts.push(...filters.roomTypes);
  if (filters.facilities.length) parts.push(...filters.facilities.slice(0,3));
  if (filters.food.length) parts.push(...filters.food.slice(0,2));
  if (filters.distance) parts.push(`Within ${filters.distance} m`);

  if (!parts.length) return <div className="text-sm muted">No active filters</div>;

  return (
    <div className="flex flex-wrap gap-2">
      {parts.map((p, i) => (
        <div key={i} className="filter-badge">
          {p} ×
        </div>
      ))}
    </div>
  );
}
