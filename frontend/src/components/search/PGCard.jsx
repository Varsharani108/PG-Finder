import { Link } from "react-router-dom";

export default function PGCard({ pg, onShowOnMap }) {
  const rentLabel = pg.rent !== null ? `₹${pg.rent}` : pg.price || "Rent unavailable";
  const ratingLabel = pg.rating !== null ? `⭐ ${pg.rating.toFixed(1)}` : "No rating yet";
  const distanceLabel = pg.distance !== null ? `${pg.distance} m` : "Distance unavailable";

  return (
    <article className="pg-card">
      <div
        className="pg-image"
        style={pg.image ? { backgroundImage: `url(${pg.image})` } : undefined}
        role="img"
        aria-label={pg.image ? pg.name : "Image unavailable"}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">{pg.name}</h3>
            <div className="text-sm text-slate mt-1">{pg.area} • {pg.city}</div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold">{rentLabel}</div>
            <div className="text-sm muted mt-1">{ratingLabel}</div>
          </div>
        </div>

        <div className="mt-3 text-sm space-y-1">
          <div className="flex flex-wrap gap-2">
            {pg.roomType && <span className="badge">{pg.roomType} sharing</span>}
            {pg.facilities.slice(0,3).map((f) => (
              <span key={f} className="badge" style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--ink)'}}>{f}</span>
            ))}
          </div>

          <div className="text-slate text-sm">Food: {pg.food.length ? pg.food.join(", ") : "Food information unavailable"}</div>
          <div className="text-slate text-sm">Distance: {distanceLabel}</div>
          {pg.reviewCount !== null && <div className="text-slate text-sm">{pg.reviewCount} review{pg.reviewCount === 1 ? "" : "s"}</div>}
          {typeof pg.availableRooms === "number" && typeof pg.totalRooms === "number" && pg.totalRooms > 0 && <div className="text-slate text-sm">{pg.availableRooms} of {pg.totalRooms} rooms available</div>}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-sm muted">{pg.college || "College unavailable"}</div>
          <div className="flex gap-2">
            <button onClick={() => onShowOnMap?.(pg.id)} className="px-3 py-1 bg-white border rounded text-sm">View on map</button>
            <Link to={`/property/${pg.id}`} className="btn-primary">View Details</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
