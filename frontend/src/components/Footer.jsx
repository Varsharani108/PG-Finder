import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

const serviceTags = [
  "PG & hostel search",
  "Room booking",
  "Tiffin services",
  "Nearby essentials",
];

const linkClass =
  "text-sm text-slate-300 transition-colors hover:text-[#f2a93b] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a93b]";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#202124] text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-9 py-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-[1.35fr_0.8fr_1.2fr_1.1fr] lg:gap-12 lg:py-12">
          <section aria-labelledby="footer-brand-heading" className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="PG Finder home">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2a93b] text-[#16233f]">
                <MapPin size={17} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span id="footer-brand-heading" className="text-base font-semibold tracking-tight">
                PG Finder
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Find a place to stay, book a room, and discover useful services for your new neighborhood.
            </p>
            <a
              href="mailto:hello@pgfinder.in"
              className={`${linkClass} mt-4 inline-flex items-center gap-2`}
            >
              <Mail size={15} className="text-[#f2a93b]" aria-hidden="true" />
              hello@pgfinder.in
            </a>
          </section>

          <nav aria-label="Footer navigation">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
              Explore
            </h2>
            <ul className="mt-4 space-y-3">
              <li><Link to="/search" className={linkClass}>Browse PGs</Link></li>
              <li><Link to="/about" className={linkClass}>About PG Finder</Link></li>
              <li><Link to="/signup?role=owner" className={linkClass}>List your property</Link></li>
            </ul>
          </nav>

          <section aria-labelledby="footer-services-heading">
            <h2 id="footer-services-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
              Our services
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {serviceTags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-slate-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="footer-owner-heading">
            <h2 id="footer-owner-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
              For property owners
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Reach people looking for their next place to stay.
            </p>
            <Link
              to="/signup?role=owner"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#f2a93b] px-3.5 py-2.5 text-sm font-semibold text-[#16233f] transition-colors hover:bg-[#d98d1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#202124]"
            >
              Create owner account
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </section>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PG Finder. All rights reserved.</p>
          <p>Made for students and professionals.</p>
        </div>
      </div>
    </footer>
  );
}
