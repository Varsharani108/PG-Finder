import "dotenv/config";
import { connectDB } from "./config/db.js";
import Stat from "./models/Stat.js";
import Faq from "./models/Faq.js";
import Team from "./models/Team.js";
import mongoose from "mongoose";

const faqs = [
  {
    question: "How do I book a room?",
    answer:
      "Search for PGs, hostels, or lodges in your city, open a listing, and choose a room. You can confirm the booking online — no site visit required to get started.",
    order: 1,
  },
  {
    question: "How are properties verified?",
    answer:
      "Every listing is checked by our admin team before it goes live — ownership documents, photos, and on-ground details are confirmed to keep listings trustworthy.",
    order: 2,
  },
  {
    question: "Can owners list services along with rooms?",
    answer:
      "Yes. Property owners can list rooms plus extra services like tiffin delivery, so tenants can arrange everything from one dashboard.",
    order: 3,
  },
  {
    question: "How does tiffin booking work?",
    answer:
      "Pick a nearby tiffin provider from your area page, choose a meal plan, and subscribe. Delivery updates and pause/resume options are managed from your account.",
    order: 4,
  },
];

const team = [
  {
    name: "Add your name",
    role: "Founder & CEO",
    group: "founder",
    bio: "Started this platform to make finding safe, verified student housing effortless.",
    order: 1,
  },
  {
    name: "Add co-founder name",
    role: "Co-Founder & Operations",
    group: "founder",
    order: 2,
  },
  {
    name: "Development Team",
    role: "Full-stack Engineering",
    group: "developer",
    bio: "Builds and maintains the search, booking, and verification systems.",
    order: 1,
  },
  {
    name: "Project Mentor",
    role: "Faculty Guide",
    group: "mentor",
    bio: "Guiding the project's technical direction (college project only — remove if not applicable).",
    order: 1,
  },
];

async function run() {
  await connectDB();

  await Stat.deleteMany({});
  await Stat.create({
    propertiesListed: 1200,
    activeUsers: 8500,
    citiesCovered: 24,
    localServices: 3600,
  });

  await Faq.deleteMany({});
  await Faq.insertMany(faqs);

  await Team.deleteMany({});
  await Team.insertMany(team);

  console.log("[seed] done");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
