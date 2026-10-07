import { useEffect, useState } from "react";
import { Shield, MapPin, Zap, Layout } from "lucide-react";

const reasons = [
  {
    tag: "Trust",
    title: "Verified properties",
    desc: "Every listing passes an admin check before it's visible to users.",
    icon: Shield,
    color: "linear-gradient(135deg, #667eea, #764ba2)"
  },
  {
    tag: "Location",
    title: "Location-based services",
    desc: "Everything shown is mapped to your actual locality, not a whole city.",
    icon: MapPin,
    color: "linear-gradient(135deg, #f093fb, #f5576c)"
  },
  {
    tag: "Simplicity",
    title: "Easy booking process",
    desc: "Search, compare, and book a room in a few taps — no broker calls.",
    icon: Zap,
    color: "linear-gradient(135deg, #4facfe, #00f2fe)"
  },
  {
    tag: "Coverage",
    title: "One platform, every need",
    desc: "Accommodation and local services live together, not across five apps.",
    icon: Layout,
    color: "linear-gradient(135deg, #43e97b, #38f9d7)"
  },
];

export default function WhyChooseUs() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .why-card-item {
          animation: fadeInScale 0.6s ease-out backwards;
        }
        .why-card-item:nth-child(1) { animation-delay: 0s; }
        .why-card-item:nth-child(2) { animation-delay: 0.1s; }
        .why-card-item:nth-child(3) { animation-delay: 0.2s; }
        .why-card-item:nth-child(4) { animation-delay: 0.3s; }
      `}</style>

      {/* Background elements */}
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
            Why choose us
          </p>
          <h2 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "white",
            margin: "0 0 15px 0",
            letterSpacing: "-1px"
          }}>
            Built around trust, not just listings.
          </h2>
          <p style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Four reasons students and professionals stick with PG Finder after the first booking.
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {reasons.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="why-card-item" style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
                padding: "32px 24px",
                borderRadius: "12px",
                border: "2px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(102,126,234,0.2)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}>
                {/* Top accent */}
                <div style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  right: "0",
                  height: "4px",
                  background: r.color
                }}></div>

                {/* Icon */}
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: r.color,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                }}>
                  <Icon size={24} color="white" />
                </div>

                {/* Tag */}
                <div style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.8)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "12px"
                }}>
                  {r.tag}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "white",
                  margin: "0 0 12px 0",
                  lineHeight: "1.4"
                }}>
                  {r.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: "1.6",
                  margin: "0"
                }}>
                  {r.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
