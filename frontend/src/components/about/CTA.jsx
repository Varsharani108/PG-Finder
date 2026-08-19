import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section>
      <div className="wrap">
        <div className="cta">
          <div className="cta-inner">
            <h2>Find Your Perfect Stay Today</h2>
            <p>Explore verified PGs near you, or list your property in a few minutes.</p>
            <div className="cta-buttons">
              <a className="btn btn-primary" href="#">
                Explore Verified PGs Near You <ArrowRight size={15} />
              </a>
              <a className="btn btn-outline" href="#">
                Join as a Property Owner
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
