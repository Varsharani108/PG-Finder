import { Home, Soup, ShieldCheck } from "lucide-react";

export default function WhoWeAre() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">Who we are</p>
          <h1>
            One address for every <em>PG, room, and errand</em> around campus or work.
          </h1>
          <p className="lede">
            Nestlocal is a search-and-booking platform that helps students and working
            professionals find verified PGs, hostels, and lodges — and everything nearby
            they'll actually need, from tiffin services to the closest pharmacy.
          </p>
          <div className="hero-origin">
            <strong>Why we built this</strong>
            Moving to a new city usually means juggling broker calls, unverified listings,
            and a dozen separate apps for food and errands. We built one place that solves
            the accommodation search and the local-life search together.
          </div>
        </div>

        <div className="locality-card">
          <div className="locality-card-row">
            <span className="ico">
              <Home size={16} />
            </span>
            Verified PGs &amp; hostels near you
          </div>
          <div className="locality-card-row">
            <span className="ico">
              <Soup size={16} />
            </span>
            Tiffin plans from local kitchens
          </div>
          <div className="locality-card-row">
            <span className="ico">
              <ShieldCheck size={16} />
            </span>
            Admin-checked listings, always
          </div>
        </div>
      </div>
    </section>
  );
}
