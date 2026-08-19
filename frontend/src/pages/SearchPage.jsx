import { useMemo, useState } from "react";
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
import { useRef } from "react";

const MOCK_PGS = [
  {
    id: 1,
    name: "Amritsar PG - Sunrise",
    city: "Amritsar",
    area: "Near Amritsar Group of Colleges",
    college: "Amritsar Group of Colleges",
    rent: 5000,
    roomType: "single",
    gender: "female",
    facilities: ["Wi-Fi", "AC", "Attached bathroom", "Washing machine"],
    food: ["Breakfast", "Dinner"],
    distance: 600,
    rating: 4.2,
    image: "/images/pg1.jpg",
  },
  {
    id: 2,
    name: "CityCentral PG",
    city: "Amritsar",
    area: "Civil Lines",
    college: "Govt College",
    rent: 8000,
    roomType: "double",
    gender: "co-living",
    facilities: ["Wi-Fi", "Parking", "Study table"],
    food: ["Lunch", "Dinner"],
    distance: 1200,
    rating: 3.8,
    image: "/images/pg2.jpg",
  },
  {
    id: 3,
    name: "Budget Stay PG",
    city: "Amritsar",
    area: "Old City",
    college: "Amritsar Group of Colleges",
    rent: 3500,
    roomType: "triple",
    gender: "male",
    facilities: ["Washing machine", "Furniture"],
    food: ["Vegetarian"],
    distance: 400,
    rating: 4.6,
    image: "/images/pg3.jpg",
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState({ min: "", max: "" });
  const [roomTypes, setRoomTypes] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [food, setFood] = useState([]);
  const [distance, setDistance] = useState(null);
  const [sort, setSort] = useState("recommended");

  const filtered = useMemo(() => {
    let res = MOCK_PGS.slice();

    if (query) {
      const q = query.toLowerCase();
      res = res.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          (p.college && p.college.toLowerCase().includes(q))
      );
    }

    if (location) {
      const l = location.toLowerCase();
      res = res.filter(
        (p) => p.area.toLowerCase().includes(l) || p.college?.toLowerCase().includes(l)
      );
    }

    if (budget.min) res = res.filter((p) => p.rent >= Number(budget.min));
    if (budget.max) res = res.filter((p) => p.rent <= Number(budget.max));

    if (roomTypes.length) res = res.filter((p) => roomTypes.includes(p.roomType));

    if (facilities.length)
      res = res.filter((p) => facilities.every((f) => p.facilities.includes(f)));

    if (food.length) res = res.filter((p) => food.every((f) => p.food.includes(f)));

    if (distance)
      res = res.filter((p) => {
        if (distance === "500") return p.distance <= 500;
        if (distance === "1000") return p.distance <= 1000;
        if (distance === "2000") return p.distance <= 2000;
        if (distance === "5000") return p.distance <= 5000;
        return true;
      });

    if (sort === "lowest") res.sort((a, b) => a.rent - b.rent);
    if (sort === "highest_rating") res.sort((a, b) => b.rating - a.rating);

    return res;
  }, [query, location, budget, roomTypes, facilities, food, distance, sort]);

  const clearAll = () => {
    setQuery("");
    setLocation("");
    setBudget({ min: "", max: "" });
    setRoomTypes([]);
    setFacilities([]);
    setFood([]);
    setDistance(null);
    setSort("recommended");
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
          <SearchBar query={query} setQuery={setQuery} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1 filter-panel sticky-panel">
              <div className="space-y-4">
                <LocationSelector value={location} onChange={setLocation} />
                <BudgetFilter value={budget} onChange={setBudget} />
                <RoomTypeFilter value={roomTypes} onChange={setRoomTypes} />
                <FacilitiesFilter value={facilities} onChange={setFacilities} />
                <FoodFilter value={food} onChange={setFood} />
                <DistanceFilter value={distance} onChange={setDistance} />
                <SortDropdown value={sort} onChange={setSort} />
                <ClearFilters onClear={clearAll} />
              </div>
            </aside>

            <main className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <ActiveFilters
                  filters={{ budget, roomTypes, facilities, food, distance }}
                />
                <div className="text-sm text-slate">{filtered.length} results</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((pg) => (
                  <PGCard key={pg.id} pg={pg} onShowOnMap={showOnMap} />
                ))}
              </div>

              <div ref={mapRef}>
                <MapView items={filtered} highlightedId={highlighted} />
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
