import {
  Search,
  CalendarCheck,
  Soup,
  Dumbbell,
  Landmark,
  Store,
} from "lucide-react";

const offerings = [
  {
    icon: Search,
    title: "PG / Hostel / Lodge search",
    desc: "Filter by budget, gender preference, sharing type, and distance from your campus or office.",
  },
  {
    icon: CalendarCheck,
    title: "Room booking",
    desc: "Reserve a room online and track your booking status without a single phone call.",
  },
  {
    icon: Soup,
    title: "Tiffin service booking",
    desc: "Subscribe to a local tiffin plan and manage delivery, pause, or renewal from your account.",
  },
  {
    icon: Store,
    title: "Nearby essentials",
    desc: "Shops, gyms, libraries, hospitals, and pharmacies mapped around your exact locality.",
  },
  {
    icon: Landmark,
    title: "Tourist & local attractions",
    desc: "Discover what's worth exploring around your new neighborhood, not just where to sleep.",
  },
  {
    icon: Dumbbell,
    title: "One dashboard, every service",
    desc: "Accommodation and daily-life services managed from a single account.",
  },
];

export default function Offerings() {
  return (
    <section id="offerings">
      <div className="wrap">
        <p className="eyebrow">What we offer</p>
        <h2 className="section-title">Everything you need to settle in, in one place.</h2>
        <p className="section-lede">
          From finding a room to finding a gym — the whole move, covered.
        </p>

        <div className="offer-grid">
          {offerings.map(({ icon: Icon, title, desc }) => (
            <div className="offer-card" key={title}>
              <span className="ico">
                <Icon size={19} />
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
