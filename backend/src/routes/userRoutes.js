import { Router } from "express";
import Booking from "../models/Booking.js";
import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/createNotification.js";

const router = Router();
router.use(protect, authorize("user"));

const propertyFields = "name location rooms price description status verificationStatus moderationReason rejectionReason owner";

router.get("/dashboard", async (req, res) => {
  try {
    const [user, inquiries, bookings] = await Promise.all([
      req.user.populate({ path: "savedProperties", select: propertyFields, populate: { path: "owner", select: "name email" } }),
      Inquiry.find({ tenant: req.user._id }).populate("property", propertyFields).sort({ createdAt: -1 }),
      Booking.find({ tenant: req.user._id }).populate({ path: "property", select: propertyFields, populate: { path: "owner", select: "name email phone" } }).sort({ createdAt: -1 }),
    ]);
    const searches = [...(user.recentSearches || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const notifications = [
      ...inquiries.slice(0, 8).map((item) => ({ id: `inquiry-${item._id}`, type: "inquiry", title: `Inquiry ${item.status.toLowerCase()}`, message: item.property?.name || "A saved property", createdAt: item.updatedAt || item.createdAt, status: item.status })),
      ...bookings.slice(0, 8).map((item) => ({ id: `booking-${item._id}`, type: "booking", title: `Booking ${item.status.toLowerCase()}`, message: item.property?.name || "A property request", createdAt: item.updatedAt || item.createdAt, status: item.status })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 12);
    res.json({
      user: req.user.toSafeObject(),
      savedProperties: user.savedProperties || [],
      recentSearches: searches,
      inquiries,
      bookings,
      notifications,
      stats: { savedProperties: (user.savedProperties || []).length, recentSearches: searches.length, activeInquiries: inquiries.filter((item) => item.status !== "Closed").length, bookings: bookings.length },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load your dashboard", error: err.message });
  }
});

router.post("/saved-properties/:propertyId", async (req, res) => {
  const property = await Property.findOne({ _id: req.params.propertyId, verificationStatus: "verified", status: "Active" });
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
  const listing = await Property.findOne({ _id: property, verificationStatus: "verified", status: "Active" });
  if (!listing) return res.status(404).json({ message: "Active property not found" });
  if (!message?.trim()) return res.status(400).json({ message: "Inquiry message is required" });
  const inquiry = await Inquiry.create({ property, tenant: req.user._id, message: message.trim() });
  await createNotification({ recipient: listing.owner, type: "inquiry", title: "New inquiry received", message: `${req.user.name} sent an inquiry about ${listing.name}.`, relatedId: inquiry._id });
  res.status(201).json({ message: "Inquiry sent.", inquiry });
});

router.post("/bookings", async (req, res) => {
  const { property, moveInDate, rent, occupants = 1 } = req.body;
  const listing = await Property.findOne({ _id: property, verificationStatus: "verified", status: "Active" });
  if (!listing) return res.status(404).json({ message: "Active property not found" });
  const existing = await Booking.findOne({ property, tenant: req.user._id, status: { $in: ["Pending", "Confirmed", "Active"] } });
  if (existing) return res.status(409).json({ message: "You already have an active booking request for this property." });
  const booking = await Booking.create({ user: req.user._id, owner: listing.owner, property, tenant: req.user._id, moveInDate, rent, amount: Number(rent || 0), occupants, bookingDate: new Date(), status: "Pending" });
  await createNotification({ recipient: listing.owner, type: "booking", title: "New booking request", message: `${req.user.name} requested a booking for ${listing.name}.`, relatedId: booking._id });
  await createNotification({ recipient: req.user._id, type: "booking", title: "Booking submitted", message: `Your booking request for ${listing.name} is pending review.`, relatedId: booking._id });
  res.status(201).json({ message: "Booking request submitted.", booking });
});

export default router;