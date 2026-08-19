const steps = [
  {
    num: "01",
    title: "User searches for rooms",
    desc: "Filter PGs, hostels, and lodges by area, budget, and preferences.",
  },
  {
    num: "02",
    title: "Owner lists properties & services",
    desc: "Property owners add rooms, pricing, photos, and add-on services like tiffin.",
  },
  {
    num: "03",
    title: "Admin verifies listings",
    desc: "Our team checks documents and details before a listing goes live.",
  },
  {
    num: "04",
    title: "User books rooms & services",
    desc: "Confirm a room and any local services, all from one booking flow.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works">
      <div className="wrap">
        <p className="eyebrow">How it works</p>
        <h2 className="section-title">Four stops from search to move-in.</h2>
        <p className="section-lede">
          The same route runs for every booking on the platform.
        </p>

        <div className="route">
          <div className="route-line" />
          <div className="route-steps">
            {steps.map((step) => (
              <div className="route-step" key={step.num}>
                <div className="route-pin">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
