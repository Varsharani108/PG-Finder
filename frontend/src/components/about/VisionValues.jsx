import { HeartHandshake, Eye, Smile, Users } from "lucide-react";
import { useEffect, useState } from "react";

const values = [
  {
    icon: HeartHandshake,
    title: "Trust",
    desc: "Verification isn't a badge — it's a requirement for every listing.",
    color: "#667eea"
  },
  {
    icon: Eye,
    title: "Transparency",
    desc: "Clear pricing, clear terms, no hidden broker fees.",
    color: "#f093fb"
  },
  {
    icon: Smile,
    title: "Convenience",
    desc: "Fewer apps, fewer calls, one dashboard for the whole move.",
    color: "#4facfe"
  },
  {
    icon: Users,
    title: "Community Support",
    desc: "Built with feedback from the students and owners who use it daily.",
    color: "#43e97b"
  },
];

export default function VisionValues() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section style={{
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
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .vision-values-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .vision-values-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
        .value-item {
          animation: fadeInUp 0.6s ease-out backwards;
        }
        .value-item:nth-child(1) { animation-delay: 0s; }
        .value-item:nth-child(2) { animation-delay: 0.1s; }
        .value-item:nth-child(3) { animation-delay: 0.2s; }
        .value-item:nth-child(4) { animation-delay: 0.3s; }
      `}</style>

      <div className="wrap" style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div className="vision-values-grid">
          {/* Left Side - Vision */}
          <div style={{
            animation: isVisible ? "fadeInLeft 0.8s ease-out" : "none"
          }}>
            <p style={{
              color: "#667eea",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 20px 0"
            }}>
              Our vision
            </p>

            <div style={{
              background: "white",
              padding: "40px",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              border: "2px solid transparent",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(102,126,234,0.15)";
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
              <div style={{
                width: "50px",
                height: "50px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                boxShadow: "0 10px 25px rgba(102,126,234,0.3)"
              }}>
                <span style={{fontSize: "28px"}}>🎯</span>
              </div>
              <p style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#1a202c",
                margin: "0 0 15px 0"
              }}>
                Become the most trusted relocation platform for students and professionals.
              </p>
              <p style={{
                fontSize: "16px",
                color: "#4a5568",
                lineHeight: "1.7",
                margin: "0"
              }}>
                Build a complete local ecosystem around accommodation, connecting people with homes and making relocations effortless.
              </p>
            </div>
          </div>

          {/* Right Side - Values */}
          <div style={{
            animation: isVisible ? "fadeInRight 0.8s ease-out" : "none"
          }}>
            <p style={{
              color: "#667eea",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0 0 20px 0"
            }}>
              Our values
            </p>

            <h2 style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "#1a202c",
              margin: "0 0 40px 0",
              letterSpacing: "-0.5px"
            }}>
              What we optimize for
            </h2>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}>
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="value-item" style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    display: "flex",
                    gap: "16px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                    border: "2px solid transparent",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 15px 50px rgba(0,0,0,0.1)";
                    e.currentTarget.style.borderColor = value.color;
                    e.currentTarget.style.transform = "translateX(8px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}>
                    <div style={{
                      minWidth: "40px",
                      width: "40px",
                      height: "40px",
                      background: value.color,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: `0 8px 20px ${value.color}40`
                    }}>
                      <Icon size={20} color="white" />
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#1a202c",
                        margin: "0 0 6px 0"
                      }}>
                        {value.title}
                      </h4>
                      <p style={{
                        fontSize: "13px",
                        color: "#4a5568",
                        lineHeight: "1.6",
                        margin: "0"
                      }}>
                        {value.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
