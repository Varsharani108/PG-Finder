import { useEffect, useState } from "react";
import { getTeam } from "../../api/client.js";

const GROUP_LABELS = {
  founder: "Founders",
  developer: "Development Team",
  mentor: "Project Mentors",
};

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeam()
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const grouped = members.reduce((acc, m) => {
    acc[m.group] = acc[m.group] || [];
    acc[m.group].push(m);
    return acc;
  }, {});

  return (
    <section>
      <div className="wrap">
        <p className="eyebrow">Meet the team</p>
        <h2 className="section-title">The people building PG Finder.</h2>
        <p className="section-lede">
          Founders, engineers, and — for the college-project version — our mentors.
        </p>

        {loading && <p className="section-lede">Loading team…</p>}

        {!loading &&
          Object.entries(GROUP_LABELS).map(([key, label]) =>
            grouped[key]?.length ? (
              <div className="team-group" key={key}>
                <h3>{label}</h3>
                <div className="team-grid">
                  {grouped[key].map((m) => (
                    <div className="team-card" key={m._id}>
                      <div className="team-avatar">{initials(m.name)}</div>
                      <h4>{m.name}</h4>
                      <div className="role">{m.role}</div>
                      {m.bio && <p>{m.bio}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
      </div>
    </section>
  );
}
