import { useEffect, useState } from "react";
import { getStats } from "../../api/client.js";
import { BarChart3, Users, Globe, Lightbulb } from "lucide-react";

function formatNum(n) {
  if (n === undefined || n === null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k+`;
  return `${n}+`;
}

function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!value) return;
    const numValue = typeof value === "string" ? parseInt(value) : value;
    const increment = numValue / (duration / 16);
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setCount(numValue);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value, duration]);

  return formatNum(count);
}

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => setStats(null));
    setIsVisible(true);
  }, []);

  const cells = [
    {
      label: "Properties listed",
      value: stats?.propertiesListed,
      icon: BarChart3,
      color: "linear-gradient(135deg, #667eea, #764ba2)"
    },
    {
      label: "Users on the platform",
      value: stats?.activeUsers,
      icon: Users,
      color: "linear-gradient(135deg, #f093fb, #f5576c)"
    },
    {
      label: "Cities covered",
      value: stats?.citiesCovered,
      icon: Globe,
      color: "linear-gradient(135deg, #4facfe, #00f2fe)"
    },
    {
      label: "Local services available",
      value: stats?.localServices,
      icon: Lightbulb,
      color: "linear-gradient(135deg, #43e97b, #38f9d7)"
    },
  ];

  return (
    <section style={{
      padding: "100px 20px",
      background: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
      position: "relative",
      overflow: "hidden"
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
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .stat-card-item {
          animation: fadeInScale 0.6s ease-out backwards;
        }
        .stat-card-item:nth-child(1) { animation-delay: 0s; }
        .stat-card-item:nth-child(2) { animation-delay: 0.1s; }
        .stat-card-item:nth-child(3) { animation-delay: 0.2s; }
        .stat-card-item:nth-child(4) { animation-delay: 0.3s; }
      `}</style>

      {/* Background decorations */}
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        background: "rgba(102, 126, 234, 0.1)",
        borderRadius: "50%",
        top: "-100px",
        right: "-100px"
      }}></div>
      <div style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        background: "rgba(245, 87, 108, 0.1)",
        borderRadius: "50%",
        bottom: "-50px",
        left: "-50px"
      }}></div>

      <div className="wrap" style={{
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "60px",
          animation: isVisible ? "fadeInUp 0.8s ease-out" : "none"
        }}>
          <p style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "0 0 15px 0"
          }}>
            By the numbers
          </p>
          <h2 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "white",
            margin: "0 0 15px 0",
            letterSpacing: "-1px"
          }}>
            Growing, city by city.
          </h2>
          <p style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Our platform is expanding rapidly, connecting thousands of students and professionals to their perfect accommodation.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px"
        }}>
          {cells.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="stat-card-item" style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                padding: "32px 24px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "center",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(102,126,234,0.2)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}>
                {/* Icon */}
                <div style={{
                  width: "56px",
                  height: "56px",
                  background: c.color,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}>
                  <Icon size={28} color="white" />
                </div>

                {/* Number */}
                <div style={{
                  fontSize: "40px",
                  fontWeight: "800",
                  background: `${c.color}`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "12px",
                  lineHeight: "1"
                }}>
                  {isVisible && <AnimatedCounter value={c.value} duration={2000} />}
                </div>

                {/* Label */}
                <div style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: "500"
                }}>
                  {c.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
