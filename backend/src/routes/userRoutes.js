import { Router } from "express";
import Booking from "../models/Booking.js";
import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";
import Notification from "../models/Notification.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/createNotification.js";

const router = Router();
router.use(protect, authorize("user"));

const propertyFields = "name description location city area college price monthlyRent rooms roomType genderPreference facilities food foodIncluded distanceFromCollege rating reviewCount availableRooms totalRooms images status verificationStatus";

router.get("/dashboard", async (req, res) => {
  try {
    const [user, inquiries, bookings, notifications] = await Promise.all([
      req.user.populate({ path: "savedProperties", select: propertyFields }),
      Inquiry.find({ tenant: req.user._id }).populate("property", propertyFields).sort({ createdAt: -1 }),
      Booking.find({ tenant: req.user._id }).populate("property", propertyFields).sort({ createdAt: -1 }),
      Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(30).lean(),
    ]);
    const searches = [...(user.recentSearches || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const visibleSaved = (user.savedProperties || []).filter(Boolean);
    res.json({
      user: req.user.toSafeObject(),
      savedProperties: visibleSaved,
      recentSearches: searches,
      inquiries,
      bookings,
      notifications,
      stats: { savedProperties: visibleSaved.length, recentSearches: searches.length, activeInquiries: inquiries.filter((item) => item.status !== "Closed").length, pendingBookings: bookings.filter((item) => item.status === "Pending").length, confirmedBookings: bookings.filter((item) => ["Confirmed", "Active"].includes(item.status)).length, unreadNotifications: notifications.filter((item) => !item.readAt).length },
    });
  } catch (err) {
    console.error("[user:dashboard] failed", err.message);
    res.status(500).json({ message: "Could not load your dashboard" });
  }
});

router.post("/saved-properties/:propertyId", async (req, res) => {
  const property = await Property.findOne({ _id: req.params.propertyId, verificationStatus: "verified", status: "active" });
  if (!property) return res.status(404).json({ message: "Active property not found" });
  await req.user.updateOne({ $addToSet: { savedProperties: property._id } });
  res.status(201).json({ message: "Property saved." });
});

router.delete("/saved-properties/:propertyId", async (req, res) => {
  await req.user.updateOne({ $pull: { savedProperties: req.params.propertyId } });
  res.json({ message: "Property removed from saved PGs." });
});

router.post("/searches", async (req, res) => {
  const { query = "", location = "", filters = {} } = req.body;
  await req.user.updateOne({ $push: { recentSearches: { $each: [{ query, location, filters }], $slice: -10 } } });
  res.status(201).json({ message: "Search saved." });
});

router.post("/inquiries", async (req, res) => {
  const { property, message } = req.body;
  const listing = await Property.findOne({ _id: property, verificationStatus: "verified", status: "active" });
  if (!listing) return res.status(404).json({ message: "Active property not found" });
  if (!message?.trim()) return res.status(400).json({ message: "Inquiry message is required" });
  const duplicate = await Inquiry.findOne({ property: listing._id, tenant: req.user._id, status: { $in: ["New", "Viewed"] } });
  if (duplicate) return res.status(409).json({ message: "You already have a pending inquiry for this PG." });
  const inquiry = await Inquiry.create({ property, tenant: req.user._id, message: message.trim() });
  await createNotification({ recipient: listing.owner, type: "inquiry", title: "New inquiry received", message: `${req.user.name} sent an inquiry about ${listing.name}.`, relatedId: inquiry._id });
  res.status(201).json({ message: "Inquiry sent.", inquiry });
});

router.post("/bookings", async (req, res) => {
  const { property, moveInDate, occupants = 1 } = req.body;
  const listing = await Property.findOne({ _id: property, verificationStatus: "verified", status: "active" });
  if (!listing) return res.status(404).json({ message: "Active property not found" });
  if (!(listing.totalRooms > 0) || !(listing.availableRooms > 0)) return res.status(409).json({ message: "No rooms are currently available." });
  if (moveInDate && Number.isNaN(new Date(moveInDate).getTime())) return res.status(400).json({ message: "Move-in date is invalid." });
  if (moveInDate && new Date(moveInDate) < new Date(new Date().setHours(0, 0, 0, 0))) return res.status(400).json({ message: "Move-in date cannot be in the past." });
  if (!Number.isInteger(Number(occupants)) || Number(occupants) < 1) return res.status(400).json({ message: "Occupants must be a positive whole number." });
  const existing = await Booking.findOne({ property, tenant: req.user._id, status: { $in: ["Pending", "Confirmed", "Active"] } });
  if (existing) return res.status(409).json({ message: "You already have an active booking request for this property." });
  const bookingRent = typeof listing.monthlyRent === "number" ? listing.monthlyRent : 0;
  const booking = await Booking.create({ user: req.user._id, owner: listing.owner, property, tenant: req.user._id, moveInDate, rent: bookingRent, amount: bookingRent, occupants, bookingDate: new Date(), status: "Pending" });
  await createNotification({ recipient: listing.owner, type: "booking", title: "New booking request", message: `${req.user.name} requested a booking for ${listing.name}.`, relatedId: booking._id });
  await createNotification({ recipient: req.user._id, type: "booking", title: "Booking submitted", message: `Your booking request for ${listing.name} is pending review.`, relatedId: booking._id });
  res.status(201).json({ message: "Booking request submitted.", booking });
});

export default router;