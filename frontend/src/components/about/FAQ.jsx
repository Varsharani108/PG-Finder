import { useEffect, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { getFaqs } from "../../api/client.js";

const fallback = [
  {
    _id: "f1",
    question: "How do I book a room?",
    answer:
      "Search for PGs, hostels, or lodges in your city, open a listing, and confirm your booking online. You can track your booking status in real-time without making a single phone call.",
  },
  {
    _id: "f2",
    question: "How are properties verified?",
    answer: "Our admin team checks documents and details before any listing goes live. We verify ownership, property conditions, and owner credentials to ensure you get only authentic, verified properties.",
  },
  {
    _id: "f3",
    question: "Can owners list services?",
    answer: "Yes — owners can add services like tiffin delivery, laundry, and fitness alongside their rooms. This allows you to manage all services from a single platform.",
  },
  {
    _id: "f4",
    question: "How does tiffin booking work?",
    answer: "Choose a plan from a nearby provider and manage delivery from your account. You can pause, resume, or cancel anytime without any hassle.",
  },
];

export default function FAQ() {
  const [faqs, setFaqs] = useState(fallback);
  const [openId, setOpenId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    getFaqs()
      .then((data) => data.length && setFaqs(data))
      .catch(() => {});
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
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }
        .faq-item {
          animation: fadeInUp 0.6s ease-out backwards;
        }
        .faq-item:nth-child(1) { animation-delay: 0s; }
        .faq-item:nth-child(2) { animation-delay: 0.1s; }
        .faq-item:nth-child(3) { animation-delay: 0.2s; }
        .faq-item:nth-child(4) { animation-delay: 0.3s; }
      `}</style>

      <div className="wrap" style={{
        maxWidth: "900px",
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
            <HelpCircle size={18} style={{color: "#667eea"}} />
            <p style={{
              color: "#667eea",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: "0"
            }}>
              FAQ
            </p>
          </div>
          <h2 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#1a202c",
            margin: "0 0 15px 0",
            letterSpacing: "-1px"
          }}>
            Quick answers before you get started.
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#4a5568",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Can't find the answer you're looking for? Feel free to contact our support team.
          </p>
        </div>

        {/* FAQ List */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {faqs.map((faq, idx) => {
            const isOpen = openId === faq._id;
            return (
              <div
                key={faq._id}
                className="faq-item"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                  border: "2px solid transparent",
                  transition: "all 0.3s ease",
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s backwards`
                }}
              >
                {/* Question Button */}
                <button
                  onClick={() => setOpenId(isOpen ? null : faq._id)}
                  style={{
                    width: "100%",
                    padding: "24px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.parentElement.style.boxShadow = "0 15px 50px rgba(102,126,234,0.15)";
                    e.currentTarget.parentElement.style.borderColor = "#667eea";
                  }}
                  onMouseLeave={(e) => {
                    if (!isOpen) {
                      e.currentTarget.parentElement.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
                      e.currentTarget.parentElement.style.borderColor = "transparent";
                    }
                  }}
                >
                  <span style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#1a202c",
                    textAlign: "left",
                    flex: 1,
                    lineHeight: "1.5"
                  }}>
                    {faq.question}
                  </span>
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "24px",
                    height: "24px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    borderRadius: "50%",
                    transition: "transform 0.3s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
                  }}>
                    <ChevronDown size={16} color="white" strokeWidth={3} />
                  </span>
                </button>

                {/* Answer Section */}
                <div style={{
                  maxHeight: isOpen ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease, opacity 0.3s ease",
                  opacity: isOpen ? 1 : 0,
                  borderTop: isOpen ? "1px solid #e2e8f0" : "none"
                }}>
                  <div style={{
                    padding: "24px",
                    color: "#4a5568",
                    fontSize: "15px",
                    lineHeight: "1.8",
                    animation: isOpen ? "fadeInUp 0.3s ease" : "none"
                  }}>
                    {faq.answer}
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
