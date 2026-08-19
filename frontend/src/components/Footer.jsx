import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Instagram, Facebook, Linkedin, ArrowUpRight } from "lucide-react";

const columns = [
  {
    title: "Explore",
    links: [
      ["Find a PG", "/search"],
      ["Explore Areas", "/search"],
      ["Tiffin services", "/about"],
      ["Local services", "/about"],
    ],
  },
  {
    title: "For Owners",
    links: [
      ["List Your Property", "/signup?role=owner"],
      ["Owner Dashboard", "/login"],
      ["How it works", "/about"],
      ["Help & support", "/about"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About PG Finder", "/about"],
      ["Contact us", "/about"],
      ["Privacy policy", "/about"],
      ["Terms of service", "/about"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#16233f]/10 bg-[#16233f] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="grid gap-12 py-14 lg:grid-cols-[1.45fr_repeat(3,1fr)] lg:gap-14 lg:py-16">
          <div className="max-w-sm">
            <Link to="/" className="mb-5 inline-flex items-center gap-2.5" aria-label="PG Finder home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2a93b] text-[#16233f]">
                <MapPin size={18} strokeWidth={2.5} />
              </span>
              <span className="text-lg font-bold tracking-tight">PG Finder<span className="text-[#f2a93b]">.</span></span>
            </Link>
            <p className="text-sm leading-6 text-slate-500">
              Find a comfortable PG that fits your budget, location, and lifestyle, without the usual hassle.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <a href="mailto:hello@pgfinder.in" className="flex items-center gap-2 transition hover:text-[#f2a93b]"><Mail size={15} /> hello@pgfinder.in</a>
              <a href="tel:+919876543210" className="flex items-center gap-2 transition hover:text-[#f2a93b]"><Phone size={15} /> +91 98765 43210</a>
              <p className="flex items-center gap-2"><MapPin size={15} /> Pune, Maharashtra</p>
            </div>
            <div className="mt-7 flex items-center gap-2">
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-[#f2a93b] hover:text-[#f2a93b]">
                <Instagram size={16} />
              </a>
              <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-[#f2a93b] hover:text-[#f2a93b]">
                <Facebook size={16} />
              </a>
              <a href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-[#f2a93b] hover:text-[#f2a93b]">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-5 text-sm font-semibold text-white">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-slate-300 transition hover:text-[#f2a93b]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mb-10 flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#2a3a5c] px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-base font-semibold">Have a PG to list?</p>
            <p className="mt-1 text-sm text-slate-300">Reach students and professionals looking for their next home.</p>
          </div>
          <Link
            to="/signup?role=owner"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#f2a93b] px-4 py-2.5 text-sm font-bold text-[#16233f] transition hover:bg-[#d98d1c]"
          >
            List your property
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PG Finder. All rights reserved.</p>
          <p>Made for better stays in India.</p>
        </div>
      </div>
    </footer>
  );
}
