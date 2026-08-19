import { useState } from "react";
import { Mail, Phone, Instagram, Twitter, Linkedin } from "lucide-react";
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
      setStatus({ state: "ok", text: res.message || "Message sent." });
      setForm(initialForm);
    } catch (err) {
      setStatus({ state: "err", text: err.message });
    }
  }

  return (
    <section>
      <div className="wrap contact-grid">
        <div>
          <p className="eyebrow">Contact us</p>
          <h2 className="section-title">Have a question we didn't answer?</h2>
          <p className="section-lede" style={{ marginBottom: 28 }}>
            Reach out directly, or send a message and we'll get back within a day.
          </p>

          <div className="contact-info">
            <div className="contact-row">
              <span className="ico">
                <Mail size={16} />
              </span>
              support@pgfinder.app
            </div>
            <div className="contact-row">
              <span className="ico">
                <Phone size={16} />
              </span>
              +91 90000 00000
            </div>
            <div className="social-row">
              <a href="#" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" required value={form.name} onChange={update("name")} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={update("email")}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="phone">Phone (optional)</label>
            <input id="phone" value={form.phone} onChange={update("phone")} />
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              rows={4}
              required
              value={form.message}
              onChange={update("message")}
            />
          </div>
          <button className="form-submit" disabled={status.state === "loading"}>
            {status.state === "loading" ? "Sending…" : "Send message"}
          </button>
          {status.state === "ok" && <p className="form-note ok">{status.text}</p>}
          {status.state === "err" && <p className="form-note err">{status.text}</p>}
        </form>
      </div>
    </section>
  );
}
