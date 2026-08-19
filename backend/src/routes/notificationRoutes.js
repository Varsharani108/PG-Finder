import { Router } from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();
router.use(protect);

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(30).lean();
    res.json({ notifications, unreadCount: notifications.filter((item) => !item.readAt).length });
  } catch (err) {
    res.status(500).json({ message: "Could not load notifications", error: err.message });
  }
});

router.patch("/:id/read", async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id, readAt: null },
    { readAt: new Date() },
    { new: true }
  );
  if (!notification) return res.status(404).json({ message: "Notification not found or already read" });
  res.json({ message: "Notification marked as read.", notification });
});

router.patch("/read-all", async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, readAt: null }, { readAt: new Date() });
  res.json({ message: "Notifications marked as read." });
});

export default router;