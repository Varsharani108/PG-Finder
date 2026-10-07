import { Home, Soup, ShieldCheck, MapPin, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function WhoWeAre() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="hero modern-hero" style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      paddingTop: "60px"
    }}>
      {/* Animated background elements */}
      <div className="hero-bg-elements" style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0
      }}>
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          top: "-100px",
          right: "-100px",
          animation: "float 6s ease-in-out infinite"
        }}></div>
        <div style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "50%",
          bottom: "-50px",
          left: "-50px",
          animation: "float 8s ease-in-out infinite reverse"
        }}></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
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
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 40px rgba(255,255,255,0.6); }
        }
        .card-row-item {
          animation: slideInLeft 0.8s ease-out backwards;
        }
        .card-row-item:nth-child(2) {
          animation-delay: 0.2s;
        }
        .card-row-item:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>

      <div className="wrap" style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "center"
      }}>
        {/* Left Content */}
        <div style={{
          animation: isVisible ? "fadeInUp 0.8s ease-out" : "none"
        }}>
          <p style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "14px",
            fontWeight: "600",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <MapPin size={18} /> Who we are
          </p>

          <h1 style={{
            fontSize: "48px",
            fontWeight: "800",
            color: "white",
            lineHeight: "1.2",
            marginBottom: "30px",
            letterSpacing: "-1px"
          }}>
            Find your perfect <em style={{
              fontStyle: "italic",
              background: "linear-gradient(120deg, #FFD700, #FFA500)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginLeft: "10px",
              marginRight: "10px"
            }}>room & settle in fast</em>
          </h1>

          <p style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.9)",
            lineHeight: "1.7",
            marginBottom: "30px",
            fontWeight: "500"
          }}>
            PG Finder is your all-in-one platform connecting students and professionals to verified accommodations, tiffin services, and local essentials in one seamless search.
          </p>

          <div style={{
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.2)",
            marginBottom: "20px"
          }}>
            <strong style={{
              color: "white",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px"
            }}>
              <Zap size={18} style={{color: "#FFD700"}} /> Why we built this
            </strong>
            <p style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0"
            }}>
              Relocating shouldn't mean endless broker calls and scattered apps. We unified housing search with local services—because settling in should take minutes, not months.
            </p>
          </div>
        </div>

        {/* Right Content - Feature Cards */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          <div className="card-row-item" style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.3)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            transform: "translateX(0)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateX(10px)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white"
            }}>
              <span style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                <Home size={24} color="white" />
              </span>
              Verified PGs & Hostels Near You
            </div>
          </div>

          <div className="card-row-item" style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.3)",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateX(10px)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white"
            }}>
              <span style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #00D4FF, #0099FF)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                <Soup size={24} color="white" />
              </span>
              Tiffin Plans & Local Kitchen Services
            </div>
          </div>

          <div className="card-row-item" style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.3)",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateX(10px)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255,255,255,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "none";
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white"
            }}>
              <span style={{
                width: "44px",
                height: "44px",
                background: "linear-gradient(135deg, #00FF88, #00DD77)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}>
                <ShieldCheck size={24} color="white" />
              </span>
              100% Admin-Verified Listings
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
