import { Router } from "express";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Inquiry from "../models/Inquiry.js";
import Review from "../models/Review.js";
import Contact from "../models/Contact.js";
import Report from "../models/Report.js";
import Booking from "../models/Booking.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/createNotification.js";
import { refreshPropertyRating } from "../utils/reviewAggregates.js";

const router = Router();
router.use(protect, authorize("admin"));

const userFields = "name email phone role isVerified isSuspended ownerStatus verificationStatus rejectionReason createdAt";
const propertyPopulate = [{ path: "owner", select: userFields }];

router.get("/dashboard", async (req, res) => {
  try {
    const [users, properties, inquiries, contacts, reports, reviews, bookings] = await Promise.all([
      User.find({}).select(userFields).sort({ createdAt: -1 }),
      Property.find({}).populate(propertyPopulate).sort({ createdAt: -1 }),
      Inquiry.find({}).populate("property", "name").populate("tenant", "name email").sort({ createdAt: -1 }),
      Contact.find({}).sort({ createdAt: -1 }),
      Report.find({}).populate("reporter", "name email").populate("targetUser", "name email").populate("property", "name").sort({ createdAt: -1 }),
      Review.find({}).populate("property", "name").populate("tenant", "name email").sort({ createdAt: -1 }),
      Booking.find({}).sort({ createdAt: -1 }),
    ]);
    res.json({
      users, properties, inquiries, contacts, reports, reviews, bookings,
      stats: {
        totalUsers: users.filter((user) => user.role === "user").length,
        totalOwners: users.filter((user) => user.role === "owner").length,
        totalPGs: properties.length,
        activeListings: properties.filter((property) => property.verificationStatus === "verified" && property.status === "active").length,
        pendingListings: properties.filter((property) => property.verificationStatus === "pending").length,
        pendingOwnerVerifications: users.filter((user) => user.role === "owner" && (user.verificationStatus === "pending" || user.ownerStatus === "Pending")).length,
        inquiries: inquiries.length,
        reports: reports.filter((report) => report.status === "open").length,
        totalBookings: bookings.length,
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
  const verificationStatus = req.body.verificationStatus || { Pending: "pending", Approved: "verified", Suspended: "rejected" }[req.body.ownerStatus];
  const { rejectionReason = "" } = req.body;
  const legacyStatus = { pending: "Pending", verified: "Approved", rejected: "Suspended" }[verificationStatus];
  if (!legacyStatus) return res.status(400).json({ message: "Invalid owner verification status" });
  const owner = await User.findOneAndUpdate({ _id: req.params.id, role: "owner" }, { verificationStatus, rejectionReason, ownerStatus: legacyStatus, isSuspended: verificationStatus === "rejected" }, { new: true, runValidators: true }).select(userFields);
  if (!owner) return res.status(404).json({ message: "Owner not found" });
  await createNotification({ recipient: owner._id, type: "account", title: "Owner verification updated", message: `Your owner account is now ${verificationStatus}.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`, relatedId: owner._id });
  res.json({ message: "Owner status updated.", user: owner });
});

router.patch("/properties/:id/review", async (req, res) => {
  const { status, reason = "" } = req.body;
  const verificationStatus = { Active: "verified", Rejected: "rejected", Pending: "pending", active: "verified", rejected: "rejected", pending: "pending", verified: "verified" }[status] || status;
  if (!["verified", "rejected", "pending"].includes(verificationStatus)) return res.status(400).json({ message: "Invalid listing decision" });
  if (verificationStatus === "rejected" && !reason.trim()) return res.status(400).json({ message: "A rejection reason is required." });
  const reviewDate = new Date();
  const property = await Property.findByIdAndUpdate(req.params.id, { verificationStatus, rejectionReason: verificationStatus === "rejected" ? reason.trim() : "", status: verificationStatus === "verified" ? "active" : "inactive", moderationReason: verificationStatus === "rejected" ? reason.trim() : "", reviewedBy: req.user._id, reviewedAt: reviewDate, verifiedBy: verificationStatus === "verified" ? req.user._id : undefined, verifiedAt: verificationStatus === "verified" ? reviewDate : undefined }, { new: true, runValidators: true }).populate(propertyPopulate);
  if (!property) return res.status(404).json({ message: "Property not found" });
  await createNotification({ recipient: property.owner?._id, type: "property", title: `Listing ${verificationStatus}`, message: `${property.name} was ${verificationStatus}${reason ? `: ${reason}` : "."}`, relatedId: property._id });
  res.json({ message: `Listing ${verificationStatus}.`, property });
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
  const status = req.body.status || "resolved";
  if (!["under_review", "resolved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid report status" });
  const reviewDate = new Date();
  const report = await Report.findByIdAndUpdate(req.params.id, { status, resolution: req.body.resolution || "", reviewedBy: req.user._id, reviewedAt: reviewDate, resolvedBy: status === "resolved" ? req.user._id : undefined, resolvedAt: status === "resolved" ? reviewDate : undefined }, { new: true, runValidators: true });
  if (!report) return res.status(404).json({ message: "Report not found" });
  res.json({ message: `Report ${status.replace("_", " ")}.`, report });
});

router.patch("/inquiries/:id/status", async (req, res) => {
  const { status, reply = "" } = req.body;
  if (!["New", "Viewed", "Replied", "Closed"].includes(status)) return res.status(400).json({ message: "Invalid inquiry status" });
  if (status === "Replied" && !reply.trim()) return res.status(400).json({ message: "A reply is required." });
  const update = { status };
  if (reply.trim()) {
    update.adminReply = reply.trim();
    update.repliedBy = req.user._id;
    update.repliedAt = new Date();
  }
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate("property", "name").populate("tenant", "name email");
  if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
  if (reply.trim()) await createNotification({ recipient: inquiry.tenant?._id, type: "inquiry", title: "Admin replied to your inquiry", message: `${inquiry.property?.name || "Your inquiry"}: ${reply.trim()}`, relatedId: inquiry._id });
  res.json({ message: "Inquiry updated.", inquiry });
});

router.delete("/reviews/:id", async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  await refreshPropertyRating(review.property);
  res.json({ message: "Review removed." });
});

export default router;