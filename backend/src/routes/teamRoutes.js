import { Router } from "express";
import Team from "../models/Team.js";

const router = Router();

// GET /api/team -> everyone, grouped by founder / developer / mentor
router.get("/", async (req, res) => {
  try {
    const members = await Team.find().sort({ group: 1, order: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Could not load team", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const member = await Team.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: "Could not add team member", error: err.message });
  }
});

export default router;
