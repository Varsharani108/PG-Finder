import { Check } from "lucide-react";

const missionPoints = [
  "Help students and employees find accommodation easily, without relying on brokers or word of mouth.",
  "Put every essential local service — food, shopping, health, fitness — on the same map as the room itself.",
];

export default function Mission() {
  return (
    <section>
      <div className="wrap mission-grid">
        <div>
          <p className="eyebrow">Our mission</p>
          <h2 className="section-title">Make relocating feel like a five-minute search.</h2>
          <p className="section-lede">
            We exist to remove the friction between "I need a room" and "I'm settled in."
          </p>
        </div>
        <ul className="mission-list">
          {missionPoints.map((point) => (
            <li key={point}>
              <span className="tick">
                <Check size={14} strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
