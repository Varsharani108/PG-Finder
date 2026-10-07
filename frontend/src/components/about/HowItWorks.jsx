import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Home, CheckCircle, Zap } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "User searches for rooms",
    desc: "Filter PGs, hostels, and lodges by area, budget, and preferences.",
    icon: MapPin,
    color: "#667eea"
  },
  {
    num: "02",
    title: "Owner lists properties & services",
    desc: "Property owners add rooms, pricing, photos, and add-on services like tiffin.",
    icon: Home,
    color: "#f093fb"
  },
  {
    num: "03",
    title: "Admin verifies listings",
    desc: "Our team checks documents and details before a listing goes live.",
    icon: CheckCircle,
    color: "#4facfe"
  },
  {
    num: "04",
    title: "User books rooms & services",
    desc: "Confirm a room and any local services, all from one booking flow.",
    icon: Zap,
    color: "#43e97b"
  },
];

export default function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState([]);

  useEffect(() => {
    setVisibleSteps([]);
    steps.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleSteps(prev => [...prev, idx]);
      }, idx * 200);
    });
  }, []);

  return (
    <section id="how-it-works" style={{
      padding: "100px 20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
          50% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
        }
      `}</style>

      {/* Background elements */}
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%",
        top: "-100px",
        right: "-100px"
      }}></div>
      <div style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        background: "rgba(255,255,255,0.05)",
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
          marginBottom: "80px",
          animation: "fadeInUp 0.8s ease-out"
        }}>
          <p style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "0 0 15px 0"
          }}>
            How it works
          </p>
          <h2 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "white",
            margin: "0 0 15px 0",
            letterSpacing: "-1px"
          }}>
            Four stops from search to move-in.
          </h2>
          <p style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.9)",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            The same route runs for every booking on the platform.
          </p>
        </div>

        {/* Steps Timeline */}
        <div style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "0"
        }}>
          {/* Connecting line for larger screens */}
          <div style={{
            position: "absolute",
            top: "60px",
            left: "0",
            right: "0",
            height: "3px",
            background: "linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)",
            zIndex: 0,
            display: window.innerWidth >= 1024 ? "block" : "none"
          }}></div>

          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isVisible = visibleSteps.includes(idx);

            return (
              <div
                key={step.num}
                style={{
                  position: "relative",
                  zIndex: 2,
                  animation: isVisible ? "fadeInUp 0.6s ease-out" : "none",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(20px)"
                }}
              >
                <div style={{
                  paddingBottom: "40px"
                }}>
                  {/* Number Circle */}
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "20px",
                    position: "relative"
                  }}>
                    <div style={{
                      width: "80px",
                      height: "80px",
                      background: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: "800",
                      color: step.color,
                      boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
                      position: "relative",
                      animation: isVisible ? "pulse 2s infinite" : "none"
                    }}>
                      {step.num}
                    </div>
                  </div>

                  {/* Arrow */}
                  {idx < steps.length - 1 && (
                    <div style={{
                      display: "flex",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.3)",
                      marginBottom: "20px",
                      fontSize: "24px",
                      transform: window.innerWidth < 1024 ? "rotate(90deg)" : "rotate(0deg)"
                    }}>
                      <ArrowRight size={24} />
                    </div>
                  )}

                  {/* Content Card */}
                  <div style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "white",
                      margin: "0 0 12px 0",
                      lineHeight: "1.4"
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.85)",
                      margin: "0",
                      lineHeight: "1.6"
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
