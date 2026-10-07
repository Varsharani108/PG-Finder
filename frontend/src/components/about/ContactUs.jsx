import { useState } from "react";
import { Mail, Phone, Instagram, Twitter, Linkedin, Send, MapPin } from "lucide-react";
import { submitContact } from "../../api/client.js";

const initialForm = { name: "", email: "", phone: "", message: "" };

export default function ContactUs() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: "idle", text: "" });

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ state: "loading", text: "" });
    try {
      const res = await submitContact(form);
      setStatus({ state: "ok", text: res.message || "Message sent successfully! We'll get back to you soon." });
      setForm(initialForm);
    } catch (err) {
      setStatus({ state: "err", text: err.message });
    }
  }

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
        input, textarea {
          font-family: inherit;
        }
        input:focus, textarea:focus {
          outline: none;
        }
      `}</style>

      <div className="wrap" style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "60px",
        alignItems: "start"
      }}>
        {/* Left Side - Contact Info */}
        <div style={{
          animation: "fadeInLeft 0.8s ease-out"
        }}>
          <p style={{
            color: "#667eea",
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "0 0 15px 0"
          }}>
            Contact us
          </p>

          <h2 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#1a202c",
            margin: "0 0 15px 0",
            letterSpacing: "-1px"
          }}>
            Have a question we didn't answer?
          </h2>

          <p style={{
            fontSize: "16px",
            color: "#4a5568",
            lineHeight: "1.7",
            marginBottom: "40px"
          }}>
            Reach out directly, or send a message and we'll get back within a day.
          </p>

          {/* Contact Info Cards */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginBottom: "40px"
          }}>
            <a href="mailto:support@pgfinder.app" style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              textDecoration: "none",
              transition: "all 0.3s ease",
              border: "2px solid transparent"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 15px 50px rgba(102,126,234,0.15)";
              e.currentTarget.style.borderColor = "#667eea";
              e.currentTarget.style.transform = "translateX(8px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Mail size={20} color="white" />
              </div>
              <div>
                <div style={{fontSize: "12px", color: "#4a5568", fontWeight: "500"}}>Email</div>
                <div style={{fontSize: "15px", fontWeight: "600", color: "#1a202c"}}>support@pgfinder.app</div>
              </div>
            </a>

            <a href="tel:+919000000000" style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              textDecoration: "none",
              transition: "all 0.3s ease",
              border: "2px solid transparent"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 15px 50px rgba(102,126,234,0.15)";
              e.currentTarget.style.borderColor = "#f093fb";
              e.currentTarget.style.transform = "translateX(8px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateX(0)";
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #f093fb, #f5576c)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Phone size={20} color="white" />
              </div>
              <div>
                <div style={{fontSize: "12px", color: "#4a5568", fontWeight: "500"}}>Phone</div>
                <div style={{fontSize: "15px", fontWeight: "600", color: "#1a202c"}}>+91 90000 00000</div>
              </div>
            </a>
          </div>

          {/* Social Links */}
          <div>
            <p style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#667eea",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "12px"
            }}>
              Follow us
            </p>
            <div style={{
              display: "flex",
              gap: "12px"
            }}>
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Twitter, label: "Twitter" },
                { icon: Linkedin, label: "LinkedIn" }
              ].map(({ icon: Icon, label }) => (
                <a key={label} href="#" title={label} style={{
                  width: "40px",
                  height: "40px",
                  background: "white",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#667eea",
                  transition: "all 0.3s ease",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                  textDecoration: "none",
                  border: "2px solid transparent"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#667eea";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.color = "#667eea";
                  e.currentTarget.style.transform = "translateY(0)";
                }}>
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <form onSubmit={handleSubmit} style={{
          animation: "fadeInRight 0.8s ease-out"
        }}>
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
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.08)";
          }}>
            {/* Name and Email */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "20px"
            }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#1a202c",
                  marginBottom: "8px"
                }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={update("name")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#1a202c",
                  marginBottom: "8px"
                }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Phone */}
            <div style={{marginBottom: "20px"}}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#1a202c",
                marginBottom: "8px"
              }}>
                Phone (optional)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Message */}
            <div style={{marginBottom: "24px"}}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#1a202c",
                marginBottom: "8px"
              }}>
                Message
              </label>
              <textarea
                rows={5}
                required
                value={form.message}
                onChange={update("message")}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102,126,234,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status.state === "loading"}
              style={{
                width: "100%",
                padding: "14px",
                background: status.state === "loading"
                  ? "#ccc"
                  : "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: status.state === "loading" ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 10px 25px rgba(102,126,234,0.3)",
              }}
              onMouseEnter={(e) => {
                if (status.state !== "loading") {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(102,126,234,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (status.state !== "loading") {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(102,126,234,0.3)";
                }
              }}
            >
              {status.state === "loading" ? "Sending…" : (
                <>
                  <Send size={16} />
                  Send message
                </>
              )}
            </button>

            {/* Status Messages */}
            {status.state === "ok" && (
              <div style={{
                marginTop: "16px",
                padding: "12px",
                background: "#ecfdf5",
                border: "1px solid #6ee7b7",
                borderRadius: "6px",
                color: "#047857",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                ✓ {status.text}
              </div>
            )}
            {status.state === "err" && (
              <div style={{
                marginTop: "16px",
                padding: "12px",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "6px",
                color: "#991b1b",
                fontSize: "14px",
                fontWeight: "500"
              }}>
                ✕ {status.text}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
