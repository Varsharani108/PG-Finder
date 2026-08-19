import { useEffect, useState } from "react";
import { getStats } from "../../api/client.js";

function formatNum(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k+`;
  return `${n}+`;
}

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const cells = [
    { label: "Properties listed", value: stats?.propertiesListed },
    { label: "Users on the platform", value: stats?.activeUsers },
    { label: "Cities covered", value: stats?.citiesCovered },
    { label: "Local services available", value: stats?.localServices },
  ];

  return (
    <section className="on-dark">
      <div className="wrap">
        <p className="eyebrow">By the numbers</p>
        <h2 className="section-title">Growing, city by city.</h2>

        <div className="stats-grid">
          {cells.map((c) => (
            <div className="stat-cell" key={c.label}>
              <div className="stat-num">{formatNum(c.value)}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
