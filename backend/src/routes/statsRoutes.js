import { Router } from "express";
import Stat from "../models/Stat.js";

const router = Router();

// GET /api/stats -> the single stats document (creates a zeroed one if none exists)
router.get("/", async (req, res) => {
  try {
    let stat = await Stat.findOne();
    if (!stat) stat = await Stat.create({});
    res.json(stat);
  } catch (err) {
    res.status(500).json({ message: "Could not load statistics", error: err.message });
  }
});

// PUT /api/stats -> update the numbers (admin use)
router.put("/", async (req, res) => {
  try {
    const { propertiesListed, activeUsers, citiesCovered, localServices } = req.body;
    let stat = await Stat.findOne();
    if (!stat) stat = new Stat();

    if (propertiesListed !== undefined) stat.propertiesListed = propertiesListed;
    if (activeUsers !== undefined) stat.activeUsers = activeUsers;
    if (citiesCovered !== undefined) stat.citiesCovered = citiesCovered;
    if (localServices !== undefined) stat.localServices = localServices;

    await stat.save();
    res.json(stat);
  } catch (err) {
    res.status(400).json({ message: "Could not update statistics", error: err.message });
  }
});

export default router;
