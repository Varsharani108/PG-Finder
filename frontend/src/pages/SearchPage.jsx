import { useEffect, useRef, useState } from "react";
import SearchBar from "../components/search/SearchBar.jsx";
import LocationSelector from "../components/search/LocationSelector.jsx";
import BudgetFilter from "../components/search/BudgetFilter.jsx";
import RoomTypeFilter from "../components/search/RoomTypeFilter.jsx";
import FacilitiesFilter from "../components/search/FacilitiesFilter.jsx";
import FoodFilter from "../components/search/FoodFilter.jsx";
import DistanceFilter from "../components/search/DistanceFilter.jsx";
import SortDropdown from "../components/search/SortDropdown.jsx";
import PGCard from "../components/search/PGCard.jsx";
import MapView from "../components/search/MapView.jsx";
import ActiveFilters from "../components/search/ActiveFilters.jsx";
import ClearFilters from "../components/search/ClearFilters.jsx";
import "../styles/search.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { getPublicProperties } from "../api/propertyApi.js";

const PAGE_SIZE = 12;

function normalizeProperty(property) {
  return {
    ...property,
    id: property._id,
    city: property.city || "",
    area: property.area || property.location || "",
    rent: typeof property.monthlyRent === "number" ? property.monthlyRent : null,
    roomType: property.roomType || null,
    facilities: Array.isArray(property.facilities) ? property.facilities : [],
    food: Array.isArray(property.food) ? property.food : [],
    distance: typeof property.distanceFromCollege === "number" ? property.distanceFromCollege : null,
    latitude: typeof property.latitude === "number" ? property.latitude : null,
    longitude: typeof property.longitude === "number" ? property.longitude : null,
    rating: typeof property.rating === "number" ? property.rating : null,
    reviewCount: typeof property.reviewCount === "number" ? property.reviewCount : null,
    image: Array.isArray(property.images) ? property.images[0] : null,
  };
}

export default function SearchPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState({ min: "", max: "" });
  const [roomTypes, setRoomTypes] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [food, setFood] = useState([]);
  const [distance, setDistance] = useState(null);
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getPublicProperties({
      search: debouncedQuery || location.trim(),
      minPrice: budget.min,
      maxPrice: budget.max,
      roomType: roomTypes.length === 1 ? roomTypes[0] : undefined,
      facilities,
      food: food.filter((item) => item !== "Food included").map((item) => item.toLowerCase()),
      foodIncluded: food.includes("Food included") ? "true" : undefined,
      distance,
      sort,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data) ? data : data.properties || [];
        setProperties(items.map(normalizeProperty));
        setPagination(data.pagination || { page: 1, limit: PAGE_SIZE, total: items.length, totalPages: items.length ? 1 : 0 });
      })
      .catch(() => {
        if (!cancelled) setLoadError("Unable to load PGs. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, location, budget.min, budget.max, roomTypes, facilities, food, distance, sort, page, retryKey]);

  const updateFilter = (setter, value) => {
    setPage(1);
    setter(value);
  };

  const updateQuery = (value) => {
    setPage(1);
    setQuery(value);
    if (value) setLocation("");
  };

  const updateLocation = (value) => {
    setPage(1);
    setLocation(value);
    if (value) setQuery("");
  };

  const removeFilter = (key) => {
    if (key === "budget") return updateFilter(setBudget, { min: "", max: "" });
    if (key === "distance") return updateFilter(setDistance, null);
    if (key.startsWith("roomType:")) return updateFilter(setRoomTypes, roomTypes.filter((value) => `roomType:${value}` !== key));
    if (key.startsWith("facility:")) return updateFilter(setFacilities, facilities.filter((value) => `facility:${value}` !== key));
    if (key.startsWith("food:")) return updateFilter(setFood, food.filter((value) => `food:${value}` !== key));
    if (key === "search") {
      setPage(1);
      setQuery("");
      setDebouncedQuery("");
      setLocation("");
    }
  };

  const clearAll = () => {
    setQuery("");
    setDebouncedQuery("");
    setLocation("");
    setBudget({ min: "", max: "" });
    setRoomTypes([]);
    setFacilities([]);
    setFood([]);
    setDistance(null);
    setSort("recommended");
    setPage(1);
    setRetryKey((value) => value + 1);
  };

  const mapRef = useRef(null);
  const [highlighted, setHighlighted] = useState(null);

  const showOnMap = (pgId) => {
    setHighlighted(pgId);
    // scroll map into view
    setTimeout(() => mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  };

  return (
    <div>
      <Navbar />
      <div className="search-page">
        <div className="search-wrap">
        <h1 className="text-2xl font-semibold mb-4">PG Search</h1>

        <div className="space-y-4">
          <SearchBar query={query} setQuery={updateQuery} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1 filter-panel sticky-panel">
              <div className="space-y-4">
                <LocationSelector value={location} onChange={updateLocation} />
                <BudgetFilter value={budget} onChange={(value) => updateFilter(setBudget, value)} />
                <RoomTypeFilter value={roomTypes} onChange={(value) => updateFilter(setRoomTypes, value)} />
                <FacilitiesFilter value={facilities} onChange={(value) => updateFilter(setFacilities, value)} />
                <FoodFilter value={food} onChange={(value) => updateFilter(setFood, value)} />
                <DistanceFilter value={distance} onChange={(value) => updateFilter(setDistance, value)} />
                <SortDropdown value={sort} onChange={(value) => updateFilter(setSort, value)} />
                <ClearFilters onClear={clearAll} />
              </div>
            </aside>

            <main className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <ActiveFilters
                  filters={{ budget, roomTypes, facilities, food, distance, search: query || location }}
                  onRemove={removeFilter}
                />
                <div className="text-sm text-slate">{pagination.total} PGs found</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading && <p className="text-sm text-slate">Loading PGs...</p>}
                {loadError && <div className="text-sm text-red-600"><p>{loadError}</p><button onClick={() => setRetryKey((value) => value + 1)} className="btn-primary mt-3">Retry</button></div>}
                {!loading && !loadError && !properties.length && <div className="text-sm text-slate"><p>No PGs found for your selected filters.</p><button onClick={clearAll} className="btn-primary mt-3">Clear Filters</button></div>}
                {!loading && !loadError && properties.map((pg) => (
                  <PGCard key={pg.id} pg={pg} onShowOnMap={showOnMap} />
                ))}
              </div>

              {!loadError && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6" aria-label="Pagination">
                  <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="btn-clear-danger disabled:opacity-40">Previous</button>
                  <span className="text-sm text-slate">Page {page} of {pagination.totalPages}</span>
                  <button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="btn-primary disabled:opacity-40">Next</button>
                </div>
              )}

              <div ref={mapRef}>
                <MapView items={properties} highlightedId={highlighted} />
              </div>
            </main>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
