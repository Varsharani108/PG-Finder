import { Router } from "express";
import Contact from "../models/Contact.js";

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact -> submit the support form on the About page
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const entry = await Contact.create({ name, email, phone, message });
    res.status(201).json({ message: "Thanks — we'll get back to you soon.", entry });
  } catch (err) {
    res.status(500).json({ message: "Could not submit your message", error: err.message });
  }
});

// GET /api/contact -> list submissions (admin use)
router.get("/", async (req, res) => {
  try {
    const entries = await Contact.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Could not load messages", error: err.message });
  }
});

export default router;
