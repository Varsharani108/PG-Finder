import { Router } from "express";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Inquiry from "../models/Inquiry.js";
import Review from "../models/Review.js";
import Contact from "../models/Contact.js";
import Report from "../models/Report.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/createNotification.js";

const router = Router();
router.use(protect, authorize("admin"));

const userFields = "name email phone role isVerified isSuspended ownerStatus createdAt";
const propertyPopulate = [{ path: "owner", select: userFields }];

router.get("/dashboard", async (req, res) => {
  try {
    const [users, properties, inquiries, contacts, reports, reviews] = await Promise.all([
      User.find({}).select(userFields).sort({ createdAt: -1 }),
      Property.find({}).populate(propertyPopulate).sort({ createdAt: -1 }),
      Inquiry.find({}).populate("property", "name").populate("tenant", "name email").sort({ createdAt: -1 }),
      Contact.find({}).sort({ createdAt: -1 }),
      Report.find({}).populate("reporter", "name email").populate("targetUser", "name email").populate("property", "name").sort({ createdAt: -1 }),
      Review.find({}).populate("property", "name").populate("tenant", "name email").sort({ createdAt: -1 }),
    ]);
    res.json({
      users, properties, inquiries, contacts, reports, reviews,
      stats: {
        totalUsers: users.filter((user) => user.role === "user").length,
        totalOwners: users.filter((user) => user.role === "owner").length,
        totalPGs: properties.length,
        activeListings: properties.filter((property) => property.status === "Active").length,
        pendingListings: properties.filter((property) => property.status === "Pending").length,
        inquiries: inquiries.length + contacts.length,
        reports: reports.filter((report) => report.status === "open").length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load admin dashboard data", error: err.message });
  }
});

router.patch("/users/:id/status", async (req, res) => {
  const { isSuspended } = req.body;
  if (typeof isSuspended !== "boolean") return res.status(400).json({ message: "isSuspended must be a boolean" });
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended }, { new: true, runValidators: true }).select(userFields);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: `User ${isSuspended ? "suspended" : "activated"}.`, user });
});

router.delete("/users/:id", async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete your own admin account." });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted." });
});

router.patch("/owners/:id/status", async (req, res) => {
  const { ownerStatus } = req.body;
  if (!["Pending", "Approved", "Suspended"].includes(ownerStatus)) return res.status(400).json({ message: "Invalid owner status" });
  const owner = await User.findOneAndUpdate({ _id: req.params.id, role: "owner" }, { ownerStatus, isSuspended: ownerStatus === "Suspended" }, { new: true, runValidators: true }).select(userFields);
  if (!owner) return res.status(404).json({ message: "Owner not found" });
  await createNotification({ recipient: owner._id, type: "account", title: "Owner account status updated", message: `Your owner account is now ${ownerStatus}.`, relatedId: owner._id });
  res.json({ message: "Owner status updated.", user: owner });
});

router.patch("/properties/:id/review", async (req, res) => {
  const { status, reason = "" } = req.body;
  if (!["Active", "Rejected", "Suspended"].includes(status)) return res.status(400).json({ message: "Invalid listing decision" });
  const property = await Property.findByIdAndUpdate(req.params.id, { status, moderationReason: reason, reviewedBy: req.user._id, reviewedAt: new Date() }, { new: true, runValidators: true }).populate(propertyPopulate);
  if (!property) return res.status(404).json({ message: "Property not found" });
  await createNotification({ recipient: property.owner?._id, type: "property", title: `Listing ${status.toLowerCase()}`, message: `${property.name} was ${status.toLowerCase()}${reason ? `: ${reason}` : "."}`, relatedId: property._id });
  res.json({ message: `Listing ${status.toLowerCase()}.`, property });
});

router.put("/properties/:id", async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(propertyPopulate);
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json({ message: "Listing updated.", property });
});

router.delete("/properties/:id", async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) return res.status(404).json({ message: "Property not found" });
  res.json({ message: "Listing deleted." });
});

router.patch("/reports/:id/resolve", async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, { status: "resolved", resolution: req.body.resolution || "Resolved by admin", resolvedBy: req.user._id, resolvedAt: new Date() }, { new: true, runValidators: true });
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json({ message: "Report resolved.", report });
});

router.delete("/reviews/:id", async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  res.json({ message: "Review removed." });
});

export default router;