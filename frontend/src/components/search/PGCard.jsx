export default function PGCard({ pg, onShowOnMap }) {
  return (
    <article className="pg-card">
      <div
        className="pg-image"
        style={{ backgroundImage: `url(${pg.image || '/images/placeholder.jpg'})` }}
        role="img"
        aria-label={pg.name}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">{pg.name}</h3>
            <div className="text-sm text-slate mt-1">{pg.area} • {pg.city}</div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold">₹{pg.rent}</div>
            <div className="text-sm muted mt-1">⭐ {pg.rating}</div>
          </div>
        </div>

        <div className="mt-3 text-sm space-y-1">
          <div className="flex flex-wrap gap-2">
            <span className="badge">{pg.roomType} sharing</span>
            {pg.facilities.slice(0,3).map((f) => (
              <span key={f} className="badge" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--ink)'}}>{f}</span>
            ))}
          </div>

          <div className="text-slate text-sm">Food: {pg.food.join(', ') || '—'}</div>
          <div className="text-slate text-sm">Distance: {pg.distance} m</div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm muted">Match: <span className="font-semibold">78%</span></div>
          <div className="flex gap-2">
            <button onClick={() => onShowOnMap?.(pg.id)} className="px-3 py-1 bg-white border rounded text-sm">View on map</button>
            <button className="btn-primary">View Details</button>
          </div>
        </div>
      </div>
    </article>
  );
}
