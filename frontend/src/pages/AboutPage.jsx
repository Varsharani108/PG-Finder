import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import WhoWeAre from "../components/about/WhoWeAre.jsx";
import Mission from "../components/about/Mission.jsx";
import Offerings from "../components/about/Offerings.jsx";
import HowItWorks from "../components/about/HowItWorks.jsx";
import WhyChooseUs from "../components/about/WhyChooseUs.jsx";
import VisionValues from "../components/about/VisionValues.jsx";
import Team from "../components/about/Team.jsx";
import Stats from "../components/about/Stats.jsx";
import ContactUs from "../components/about/ContactUs.jsx";
import FAQ from "../components/about/FAQ.jsx";
import CTA from "../components/about/CTA.jsx";

export default function AboutPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
      <Navbar />
      <main>
        <WhoWeAre />
        <Mission />
        <Offerings />
        <HowItWorks />
        <WhyChooseUs />
        <VisionValues />
        <Team />
        <Stats />
        <ContactUs />
        <FAQ />
        <CTA />
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} PG Finder. Built for students and professionals, everywhere.
      </footer>
    </>
  );
}
