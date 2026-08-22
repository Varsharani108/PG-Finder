import { Router } from "express";
import Booking from "../models/Booking.js";
import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";
import Review from "../models/Review.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/createNotification.js";

const router = Router();
router.use(protect, authorize("owner"));

async function ownedPropertyIds(ownerId) {
  const properties = await Property.find({ owner: ownerId }).select("_id");
  return properties.map((property) => property._id);
}

router.get("/dashboard", async (req, res) => {
  try {
    const propertyIds = await ownedPropertyIds(req.user._id);
    const [properties, inquiries, bookings, reviews] = await Promise.all([
      Property.find({ owner: req.user._id }).sort({ createdAt: -1 }),
      Inquiry.find({ property: { $in: propertyIds } }).populate("property", "name").populate("tenant", "name email phone").sort({ createdAt: -1 }),
      Booking.find({ property: { $in: propertyIds } }).populate("property", "name location").populate("user", "name email phone").populate("tenant", "name email phone").sort({ createdAt: -1 }),
      Review.find({ property: { $in: propertyIds } }).populate("property", "name").populate("tenant", "name").sort({ createdAt: -1 }),
    ]);

    const activeTenants = bookings.filter((booking) => ["Confirmed", "Active"].includes(booking.status)).length;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const earnings = bookings
      .filter((booking) => ["Confirmed", "Active", "Completed"].includes(booking.status) && new Date(booking.createdAt) >= monthStart)
      .reduce((total, booking) => total + (booking.rent || 0), 0);
    const averageRating = reviews.length
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : 0;

    res.json({
      properties,
      inquiries,
      bookings,
      reviews,
      stats: {
        totalProperties: properties.length,
        activeTenants,
        newInquiries: inquiries.filter((inquiry) => inquiry.status === "New").length,
        revenueThisMonth: earnings,
        activeListings: properties.filter((property) => property.status === "Active").length,
        averageRating: Number(averageRating.toFixed(1)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Could not load owner dashboard data", error: err.message });
  }
});

router.patch("/inquiries/:id/status", async (req, res) => {
  try {
    const propertyIds = await ownedPropertyIds(req.user._id);
    const allowed = ["New", "Viewed", "Replied", "Closed"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid inquiry status" });
    const inquiry = await Inquiry.findOneAndUpdate(
      { _id: req.params.id, property: { $in: propertyIds } },
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate("property", "name").populate("tenant", "name email phone");
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    await createNotification({ recipient: inquiry.tenant?._id, type: "inquiry", title: "Inquiry status updated", message: `${inquiry.property?.name || "Your inquiry"} is now ${inquiry.status}.`, relatedId: inquiry._id });
    res.json(inquiry);
  } catch (err) {
    res.status(400).json({ message: "Could not update inquiry status", error: err.message });
  }
});

router.patch("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Confirmed", "Rejected", "Cancelled"].includes(status)) return res.status(400).json({ message: "Invalid booking status" });
    const booking = await Booking.findOne({ _id: req.params.id, owner: req.user._id }).populate("property", "name").populate("user", "name").populate("tenant", "name");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const allowed = { Pending: ["Confirmed", "Rejected", "Cancelled"], Confirmed: ["Cancelled"] };
    if (!allowed[booking.status]?.includes(status)) return res.status(400).json({ message: `Cannot change booking from ${booking.status} to ${status}.` });
    booking.status = status;
    await booking.save();
    await createNotification({ recipient: booking.user || booking.tenant, type: "booking", title: `Booking ${status.toLowerCase()}`, message: `Your booking for ${booking.property?.name || "this PG"} is now ${status.toLowerCase()}.`, relatedId: booking._id });
    res.json({ message: "Booking status updated.", booking });
  } catch (err) {
    res.status(400).json({ message: "Could not update booking status", error: err.message });
  }
});

export default router;
