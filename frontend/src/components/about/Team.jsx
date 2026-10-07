import { useEffect, useState } from "react";
import { getTeam } from "../../api/client.js";
import { Users, Code, BookOpen } from "lucide-react";

const GROUP_LABELS = {
  founder: "Founders",
  developer: "Development Team",
  mentor: "Project Mentors",
};

const GROUP_ICONS = {
  founder: <Users size={20} />,
  developer: <Code size={20} />,
  mentor: <BookOpen size={20} />
};

const GROUP_COLORS = {
  founder: "linear-gradient(135deg, #667eea, #764ba2)",
  developer: "linear-gradient(135deg, #f093fb, #f5576c)",
  mentor: "linear-gradient(135deg, #4facfe, #00f2fe)"
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
    <section style={{
      padding: "100px 20px",
      background: "#f8f9fa",
      position: "relative"
    }}>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .team-section-title {
          animation: fadeInUp 0.8s ease-out;
        }
        .team-group-section {
          animation: fadeInUp 0.8s ease-out;
        }
        .team-card-item {
          animation: fadeInScale 0.6s ease-out backwards;
        }
        .team-card-item:nth-child(1) { animation-delay: 0s; }
        .team-card-item:nth-child(2) { animation-delay: 0.1s; }
        .team-card-item:nth-child(3) { animation-delay: 0.2s; }
        .team-card-item:nth-child(4) { animation-delay: 0.3s; }
        .team-card-item:nth-child(5) { animation-delay: 0.4s; }
        .team-card-item:nth-child(6) { animation-delay: 0.5s; }
      `}</style>

      <div className="wrap" style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div className="team-section-title" style={{
          textAlign: "center",
          marginBottom: "60px"
        }}>
          <p style={{
            color: "#667eea",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "0 0 15px 0"
          }}>
            Meet the team
          </p>
          <h2 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#1a202c",
            margin: "0 0 15px 0",
            letterSpacing: "-1px"
          }}>
            The people building PG Finder
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#4a5568",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Founders, engineers, and mentors driving innovation in student accommodation solutions.
          </p>
        </div>

        {loading && (
          <div style={{
            textAlign: "center",
            padding: "40px",
            fontSize: "16px",
            color: "#4a5568"
          }}>
            <div style={{
              display: "inline-block",
              animation: "spin 1s linear infinite"
            }} >
              ⚙️ Loading team…
            </div>
          </div>
        )}

        {!loading &&
          Object.entries(GROUP_LABELS).map(([key, label], groupIdx) =>
            grouped[key]?.length ? (
              <div key={key} className="team-group-section" style={{
                marginBottom: "80px",
                animation: `fadeInUp 0.8s ease-out ${groupIdx * 0.2}s backwards`
              }}>
                {/* Group Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "40px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    background: GROUP_COLORS[key],
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white"
                  }}>
                    {GROUP_ICONS[key]}
                  </div>
                  <h3 style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#1a202c",
                    margin: "0"
                  }}>
                    {label}
                  </h3>
                </div>

                {/* Team Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "24px"
                }}>
                  {grouped[key].map((m, idx) => (
                    <div key={m._id} className="team-card-item" style={{
                      background: "white",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      border: "2px solid transparent"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-10px)";
                      e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.12)";
                      e.currentTarget.style.borderColor = GROUP_COLORS[key].split(",")[0];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}>
                      {/* Top Accent Bar */}
                      <div style={{
                        height: "4px",
                        background: GROUP_COLORS[key]
                      }}></div>

                      {/* Avatar */}
                      <div style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "30px 20px 20px 20px"
                      }}>
                        <div style={{
                          width: "100px",
                          height: "100px",
                          background: GROUP_COLORS[key],
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "36px",
                          fontWeight: "700",
                          color: "white",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                        }}>
                          {initials(m.name)}
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{
                        padding: "0 20px 30px 20px",
                        textAlign: "center"
                      }}>
                        <h4 style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#1a202c",
                          margin: "15px 0 8px 0"
                        }}>
                          {m.name}
                        </h4>
                        <div style={{
                          color: "#667eea",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "12px"
                        }}>
                          {m.role}
                        </div>
                        {m.bio && (
                          <p style={{
                            fontSize: "13px",
                            color: "#4a5568",
                            lineHeight: "1.6",
                            margin: "0"
                          }}>
                            {m.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
