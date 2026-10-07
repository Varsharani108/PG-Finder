import { ArrowRight, Home, Building2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section style={{
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Background decorations */}
      <div style={{
        position: "absolute",
        width: "500px",
        height: "500px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%",
        top: "-150px",
        right: "-150px",
        animation: "float 6s ease-in-out infinite"
      }}></div>
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "50%",
        bottom: "-100px",
        left: "-100px"
      }}></div>

      <div className="wrap" style={{
        maxWidth: "1000px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        animation: isVisible ? "fadeInUp 0.8s ease-out" : "none"
      }}>
        {/* Main Heading */}
        <h2 style={{
          fontSize: "48px",
          fontWeight: "800",
          color: "white",
          margin: "0 0 20px 0",
          letterSpacing: "-1px",
          lineHeight: "1.3"
        }}>
          Find Your Perfect Stay Today
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: "18px",
          color: "rgba(255,255,255,0.9)",
          margin: "0 0 50px 0",
          lineHeight: "1.7",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          Explore verified PGs in your city, or list your property to reach thousands of students and professionals actively searching for accommodation.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          maxWidth: "600px",
          margin: "0 auto"
        }}>
          {/* Primary Button */}
          <a
            href="/search"
            style={{
              padding: "16px 32px",
              background: "white",
              color: "#667eea",
              textDecoration: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "16px",
              border: "2px solid white",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 15px 40px rgba(0,0,0,0.2)";
            }}
          >
            <Home size={20} />
            Explore Verified PGs
            <ArrowRight size={18} />
          </a>

          {/* Secondary Button */}
          <a
            href="/owner/signup"
            style={{
              padding: "16px 32px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              textDecoration: "none",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "16px",
              border: "2px solid rgba(255,255,255,0.4)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              backdropFilter: "blur(10px)",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
              e.currentTarget.style.transform = "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Building2 size={20} />
            Join as Property Owner
          </a>
        </div>

        {/* Trust Badge */}
        <div style={{
          marginTop: "50px",
          paddingTop: "40px",
          borderTop: "1px solid rgba(255,255,255,0.2)"
        }}>
          <p style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.7)",
            fontWeight: "500",
            marginBottom: "20px"
          }}>
            TRUSTED BY STUDENTS & PROFESSIONALS
          </p>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
            flexWrap: "wrap"
          }}>
            {[
              { text: "500+ Properties", icon: "🏠" },
              { text: "2000+ Users", icon: "👥" },
              { text: "10+ Cities", icon: "🌍" },
              { text: "24/7 Support", icon: "💬" }
            ].map((item, idx) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "rgba(255,255,255,0.8)"
              }}>
                <span style={{fontSize: "20px"}}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
