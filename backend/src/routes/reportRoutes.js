import { Router } from "express";
import Report from "../models/Report.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect, authorize("user", "owner"));

router.post("/", async (req, res) => {
  try {
    const { targetUser, property, reason } = req.body;
    if ((!targetUser && !property) || !reason?.trim()) {
      return res.status(400).json({ message: "A user or property and a reason are required." });
    }
    const report = await Report.create({ reporter: req.user._id, targetUser, property, reason: reason.trim() });
    res.status(201).json({ message: "Report submitted.", report });
  } catch (err) {
    res.status(400).json({ message: "Could not submit report.", error: err.message });
  }
});

export default router;
