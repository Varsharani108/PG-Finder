import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapViewport({ items, highlightedId }) {
  const map = useMap();
  const coordinates = useMemo(() => items.map((item) => [item.latitude, item.longitude]), [items]);

  useEffect(() => {
    if (!coordinates.length) return;
    if (coordinates.length === 1) map.setView(coordinates[0], 15);
    else map.fitBounds(coordinates, { padding: [28, 28], maxZoom: 15 });
  }, [coordinates, map]);

  useEffect(() => {
    const item = items.find((entry) => entry.id === highlightedId);
    if (item) map.setView([item.latitude, item.longitude], Math.max(map.getZoom(), 15), { animate: true });
  }, [highlightedId, items, map]);

  return null;
}

export default function MapView({ items, highlightedId }) {
  const [mapError, setMapError] = useState(false);
  const mappedItems = items.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude));

  return (
    <section className="mt-6 border rounded-lg p-4 bg-white shadow-sm" aria-label="PG locations map">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">PG locations</h4>
        <div className="text-sm text-slate">{mappedItems.length} of {items.length} mapped</div>
      </div>
      {!mappedItems.length ? (
        <div className="h-52 bg-gray-50 rounded-md border border-dashed border-gray-200 flex items-center justify-center text-sm text-slate p-5 text-center">
          <div><p>Map locations unavailable</p><p className="mt-1 text-xs">Add latitude and longitude to a property to show accurate markers.</p></div>
        </div>
      ) : mapError ? (
        <div className="h-52 bg-gray-50 rounded-md border border-dashed border-gray-200 flex items-center justify-center text-sm text-slate">Map could not be loaded.</div>
      ) : (
        <MapContainer center={[mappedItems[0].latitude, mappedItems[0].longitude]} zoom={13} scrollWheelZoom className="pg-map" aria-label="Map showing PG locations">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setMapError(true) }} />
          <MapViewport items={mappedItems} highlightedId={highlightedId} />
          {mappedItems.map((item) => <Marker key={item.id} position={[item.latitude, item.longitude]} icon={defaultIcon}>
            <Popup><strong>{item.name}</strong><br />{typeof item.rent === "number" ? `₹${item.rent.toLocaleString("en-IN")}/month` : "Rent unavailable"}<br />{item.roomType || "Room type unavailable"}<br />{typeof item.rating === "number" ? `${item.rating.toFixed(1)} stars` : "No rating yet"}<br />{item.distance !== null ? `${item.distance} m` : "Distance unavailable"}<br /><Link to={`/property/${item.id}`}>View Details</Link></Popup>
          </Marker>)}
        </MapContainer>
      )}
    </section>
  );
}
