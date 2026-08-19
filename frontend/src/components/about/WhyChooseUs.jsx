const reasons = [
  {
    tag: "Trust",
    title: "Verified properties",
    desc: "Every listing passes an admin check before it's visible to users.",
  },
  {
    tag: "Location",
    title: "Location-based services",
    desc: "Everything shown is mapped to your actual locality, not a whole city.",
  },
  {
    tag: "Simplicity",
    title: "Easy booking process",
    desc: "Search, compare, and book a room in a few taps — no broker calls.",
  },
  {
    tag: "Coverage",
    title: "One platform, every need",
    desc: "Accommodation and local services live together, not across five apps.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="on-dark">
      <div className="wrap">
        <p className="eyebrow">Why choose us</p>
        <h2 className="section-title">Built around trust, not just listings.</h2>
        <p className="section-lede">
          Four reasons students and professionals stick with PG Finder after the first booking.
        </p>

        <div className="why-grid">
          {reasons.map((r) => (
            <div className="why-card" key={r.title}>
              <span className="tag">{r.tag}</span>
              <h3>{r.title}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
