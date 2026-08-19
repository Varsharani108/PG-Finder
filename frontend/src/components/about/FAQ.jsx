import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getFaqs } from "../../api/client.js";

const fallback = [
  {
    _id: "f1",
    question: "How do I book a room?",
    answer:
      "Search for PGs, hostels, or lodges in your city, open a listing, and confirm your booking online.",
  },
  {
    _id: "f2",
    question: "How are properties verified?",
    answer: "Our admin team checks documents and details before any listing goes live.",
  },
  {
    _id: "f3",
    question: "Can owners list services?",
    answer: "Yes — owners can add services like tiffin delivery alongside their rooms.",
  },
  {
    _id: "f4",
    question: "How does tiffin booking work?",
    answer: "Choose a plan from a nearby provider and manage delivery from your account.",
  },
];

export default function FAQ() {
  const [faqs, setFaqs] = useState(fallback);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    getFaqs()
      .then((data) => data.length && setFaqs(data))
      .catch(() => {});
  }, []);

  return (
    <section>
      <div className="wrap">
        <p className="eyebrow">FAQ</p>
        <h2 className="section-title">Quick answers before you get started.</h2>

        <div className="faq-list">
          {faqs.map((faq) => {
            const isOpen = openId === faq._id;
            return (
              <div className={`faq-item${isOpen ? " open" : ""}`} key={faq._id}>
                <button
                  className="faq-q"
                  onClick={() => setOpenId(isOpen ? null : faq._id)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span className="faq-toggle">
                    <Plus size={16} strokeWidth={2.5} />
                  </span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{faq.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
