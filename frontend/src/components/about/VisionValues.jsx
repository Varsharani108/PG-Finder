import { HeartHandshake, Eye, Smile, Users } from "lucide-react";

const values = [
  {
    icon: HeartHandshake,
    title: "Trust",
    desc: "Verification isn't a badge — it's a requirement for every listing.",
  },
  {
    icon: Eye,
    title: "Transparency",
    desc: "Clear pricing, clear terms, no hidden broker fees.",
  },
  {
    icon: Smile,
    title: "Convenience",
    desc: "Fewer apps, fewer calls, one dashboard for the whole move.",
  },
  {
    icon: Users,
    title: "Community Support",
    desc: "Built with feedback from the students and owners who use it daily.",
  },
];

export default function VisionValues() {
  return (
    <section>
      <div className="wrap vision-values">
        <div>
          <div className="vision-card">
            <p className="eyebrow">Our vision</p>
            <p>
              Become the most trusted relocation platform for students and professionals.
            </p>
            <p>Build a complete local ecosystem around accommodation.</p>
          </div>
        </div>

        <div>
          <p className="eyebrow">Our values</p>
          <h2 className="section-title" style={{ fontSize: "clamp(24px, 3vw, 30px)" }}>
            What we optimize for
          </h2>
          <div className="values-list">
            {values.map(({ icon: Icon, title, desc }) => (
              <div className="value-row" key={title}>
                <span className="ico">
                  <Icon size={17} />
                </span>
                <div>
                  <h4>{title}</h4>
                  <span>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
