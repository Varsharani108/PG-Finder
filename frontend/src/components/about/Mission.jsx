import { Check, Target } from "lucide-react";
import { useEffect, useState } from "react";

const missionPoints = [
  "Help students and employees find accommodation easily, without relying on brokers or word of mouth.",
  "Put every essential local service — food, shopping, health, fitness — on the same map as the room itself.",
];

export default function Mission() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section style={{
      padding: "100px 20px",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
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
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .mission-item {
          animation: slideInLeft 0.6s ease-out backwards;
        }
        .mission-item:nth-child(2) {
          animation-delay: 0.2s;
        }
        .check-icon {
          animation: scaleIn 0.5s ease-out backwards;
        }
      `}</style>

      <div className="wrap" style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "80px",
        alignItems: "center"
      }}>
        {/* Left Content */}
        <div style={{
          animation: isVisible ? "fadeInUp 0.8s ease-out" : "none"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px"
          }}>
            <Target size={20} style={{color: "#667eea"}} />
            <p style={{
              color: "#667eea",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0"
            }}>
              Our Mission
            </p>
          </div>

          <h2 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#1a202c",
            lineHeight: "1.3",
            marginBottom: "20px",
            letterSpacing: "-1px"
          }}>
            Make relocating feel like a <span style={{
              background: "linear-gradient(120deg, #667eea, #764ba2)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>five-minute search</span>
          </h2>

          <p style={{
            fontSize: "16px",
            color: "#4a5568",
            lineHeight: "1.7",
            marginBottom: "0"
          }}>
            We exist to remove the friction between "I need a room" and "I'm settled in."
          </p>
        </div>

        {/* Right Content - Mission Points */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          {missionPoints.map((point, idx) => (
            <div key={idx} className="mission-item" style={{
              background: "white",
              padding: "28px",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              border: "2px solid transparent",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(102, 126, 234, 0.2)";
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
              {/* Gradient accent line */}
              <div style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "4px",
                background: "linear-gradient(90deg, #667eea, #764ba2)"
              }}></div>

              <div style={{
                display: "flex",
                gap: "20px",
                alignItems: "flex-start"
              }}>
                <div className="check-icon" style={{
                  minWidth: "40px",
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Check size={22} color="white" strokeWidth={3} />
                </div>
                <p style={{
                  fontSize: "16px",
                  color: "#2d3748",
                  lineHeight: "1.7",
                  fontWeight: "500",
                  margin: "0"
                }}>
                  {point}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
