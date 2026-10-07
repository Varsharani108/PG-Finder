import {
  Search,
  CalendarCheck,
  Soup,
  Dumbbell,
  Landmark,
  Store,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";

const offerings = [
  {
    icon: Search,
    title: "PG / Hostel / Lodge search",
    desc: "Filter by budget, gender preference, sharing type, and distance from your campus or office.",
    gradient: "linear-gradient(135deg, #667eea, #764ba2)"
  },
  {
    icon: CalendarCheck,
    title: "Room booking",
    desc: "Reserve a room online and track your booking status without a single phone call.",
    gradient: "linear-gradient(135deg, #f093fb, #f5576c)"
  },
  {
    icon: Soup,
    title: "Tiffin service booking",
    desc: "Subscribe to a local tiffin plan and manage delivery, pause, or renewal from your account.",
    gradient: "linear-gradient(135deg, #4facfe, #00f2fe)"
  },
  {
    icon: Store,
    title: "Nearby essentials",
    desc: "Shops, gyms, libraries, hospitals, and pharmacies mapped around your exact locality.",
    gradient: "linear-gradient(135deg, #43e97b, #38f9d7)"
  },
  {
    icon: Landmark,
    title: "Tourist & local attractions",
    desc: "Discover what's worth exploring around your new neighborhood, not just where to sleep.",
    gradient: "linear-gradient(135deg, #fa709a, #fee140)"
  },
  {
    icon: Dumbbell,
    title: "One dashboard, every service",
    desc: "Accommodation and daily-life services managed from a single account.",
    gradient: "linear-gradient(135deg, #30cfd0, #330867)"
  },
];

export default function Offerings() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="offerings" style={{
      padding: "100px 20px",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
        @keyframes rotateIcon {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .offer-card-item {
          animation: fadeInScale 0.6s ease-out backwards;
        }
        .offer-card-item:nth-child(1) { animation-delay: 0s; }
        .offer-card-item:nth-child(2) { animation-delay: 0.1s; }
        .offer-card-item:nth-child(3) { animation-delay: 0.2s; }
        .offer-card-item:nth-child(4) { animation-delay: 0.3s; }
        .offer-card-item:nth-child(5) { animation-delay: 0.4s; }
        .offer-card-item:nth-child(6) { animation-delay: 0.5s; }
      `}</style>

      <div className="wrap" style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "60px",
          animation: isVisible ? "fadeInUp 0.8s ease-out" : "none"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "15px"
          }}>
            <Sparkles size={18} style={{color: "#667eea"}} />
            <p style={{
              color: "#667eea",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0"
            }}>
              What we offer
            </p>
          </div>
          <h2 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#1a202c",
            margin: "0 0 15px 0",
            letterSpacing: "-1px"
          }}>
            Everything you need to settle in, in one place.
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#4a5568",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            From finding a room to finding a gym — the whole move, covered.
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "28px"
        }}>
          {offerings.map(({ icon: Icon, title, desc, gradient }, idx) => (
            <div key={title} className="offer-card-item" style={{
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              transition: "all 0.3s ease",
              cursor: "pointer",
              border: "2px solid transparent",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
            }}>
              {/* Top Gradient Bar */}
              <div style={{
                height: "4px",
                background: gradient
              }}></div>

              {/* Icon Container */}
              <div style={{
                padding: "30px 20px 20px 20px",
                background: gradient,
                display: "flex",
                justifyContent: "center",
                position: "relative"
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                }}>
                  <Icon size={32} color="white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Content */}
              <div style={{
                padding: "28px 20px"
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1a202c",
                  margin: "0 0 12px 0",
                  lineHeight: "1.4"
                }}>
                  {title}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#4a5568",
                  lineHeight: "1.6",
                  margin: "0"
                }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
