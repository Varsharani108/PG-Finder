export default function MapView({ items, highlightedId }) {
  const highlighted = items.find((i) => i.id === highlightedId);

  return (
    <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Map</h4>
        <div className="text-sm text-slate">{items.length} shown</div>
      </div>
      <div className="h-52 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md border border-dashed border-gray-200 flex items-center justify-center text-sm text-slate relative">
        <div>Map placeholder</div>
        {highlighted && (
          <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded shadow text-sm">
            Highlighted: {highlighted.name}
          </div>
        )}
      </div>
    </div>
  );
}
