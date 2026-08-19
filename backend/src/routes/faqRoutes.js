import { Router } from "express";
import Faq from "../models/Faq.js";

const router = Router();

// GET /api/faqs -> ordered list of FAQs for the accordion
router.get("/", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: "Could not load FAQs", error: err.message });
  }
});

// POST /api/faqs -> add a new FAQ (admin use)
router.post("/", async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: "question and answer are required" });
    }
    const faq = await Faq.create({ question, answer, order });
    res.status(201).json(faq);
  } catch (err) {
    res.status(400).json({ message: "Could not create FAQ", error: err.message });
  }
});

export default router;
