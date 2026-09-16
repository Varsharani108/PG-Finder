import { Router } from "express";
import Booking from "../models/Booking.js";
import Inquiry from "../models/Inquiry.js";
import Property from "../models/Property.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
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
    const [properties, inquiries, bookings, reviews, notifications] = await Promise.all([
      Property.find({ owner: req.user._id }).sort({ createdAt: -1 }),
      Inquiry.find({ property: { $in: propertyIds } }).populate("property", "name").populate("tenant", "name email phone").sort({ createdAt: -1 }),
      Booking.find({ property: { $in: propertyIds } }).populate("property", "name location").populate("user", "name email phone").populate("tenant", "name email phone").sort({ createdAt: -1 }),
      Review.find({ property: { $in: propertyIds } }).populate("property", "name").populate("tenant", "name").sort({ createdAt: -1 }),
      Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(30).lean(),
    ]);

    const activeTenants = new Set(bookings.filter((booking) => ["Confirmed", "Active"].includes(booking.status)).map((booking) => String(booking.tenant || booking.user))).size;
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
      notifications,
      stats: {
        totalProperties: properties.length,
        activeTenants,
        newInquiries: inquiries.filter((inquiry) => inquiry.status === "New").length,
          pendingBookings: bookings.filter((booking) => booking.status === "Pending").length,
          rejectedProperties: properties.filter((property) => property.verificationStatus === "rejected").length,
          unreadNotifications: notifications.filter((notification) => !notification.readAt).length,
        revenueThisMonth: earnings,
        activeListings: properties.filter((property) => property.verificationStatus === "verified" && property.status === "active").length,
        averageRating: Number(averageRating.toFixed(1)),
      },
    });
  } catch (err) {
      console.error("[owner:dashboard] failed", err.message);
      res.status(500).json({ message: "Could not load owner dashboard data" });
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
    const booking = await Booking.findOne({ _id: req.params.id, owner: req.user._id }).populate("property", "name totalRooms availableRooms").populate("user", "name").populate("tenant", "name");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    const previousStatus = booking.status;
    const allowed = { Pending: ["Confirmed", "Rejected", "Cancelled"], Confirmed: ["Cancelled"] };
    if (!allowed[booking.status]?.includes(status)) return res.status(400).json({ message: `Cannot change booking from ${booking.status} to ${status}.` });
    const tracksAvailability = booking.property?.totalRooms > 0;
    if (status === "Confirmed" && tracksAvailability && !booking.availabilityReserved) {
      const reserved = await Property.findOneAndUpdate({ _id: booking.property._id, availableRooms: { $gte: 1 } }, { $inc: { availableRooms: -1 } }, { new: true });
      if (!reserved) return res.status(409).json({ message: "No rooms are currently available." });
    }
    booking.status = status;
    await booking.save();
    if (["Cancelled", "Rejected"].includes(status) && tracksAvailability && booking.availabilityReserved) {
      await Property.findByIdAndUpdate(booking.property._id, { $inc: { availableRooms: 1 } });
      booking.availabilityReserved = false;
      await booking.save();
    }
    await createNotification({ recipient: booking.user || booking.tenant, type: "booking", title: `Booking ${status.toLowerCase()}`, message: `Your booking for ${booking.property?.name || "this PG"} is now ${status.toLowerCase()}.`, relatedId: booking._id });
    res.json({ message: "Booking status updated.", booking });
  } catch (err) {
    res.status(400).json({ message: "Could not update booking status", error: err.message });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const propertyIds = await ownedPropertyIds(req.user._id);
    const [properties, bookings, reviews, inquiries] = await Promise.all([
      Property.find({ owner: req.user._id }),
      Booking.find({ property: { $in: propertyIds } }),
      Review.find({ property: { $in: propertyIds } }),
      Inquiry.find({ property: { $in: propertyIds } }),
    ]);

    const stats = {
      totalProperties: properties.length,
      activeListings: properties.filter((p) => p.verificationStatus === "verified" && p.status === "active").length,
      totalBookings: bookings.length,
      activeBookings: bookings.filter((b) => ["Confirmed", "Active"].includes(b.status)).length,
      totalReviews: reviews.length,
      averageRating: reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
      totalInquiries: inquiries.length,
      newInquiries: inquiries.filter((i) => i.status === "New").length,
    };

    res.json({
      user: req.user.toSafeObject(),
      stats,
    });
  } catch (err) {
    console.error("[owner:profile] failed", err.message);
    res.status(500).json({ message: "Could not load owner profile" });
  }
});

router.patch("/profile", async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters." });
    }
    
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit phone number." });
    }

    req.user.name = name.trim();
    req.user.phone = phone;
    await req.user.save();

    res.json({ 
      message: "Profile updated successfully.",
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    res.status(400).json({ message: "Could not update profile", error: err.message });
  }
});

router.patch("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({ message: "New password must be different from current password." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("[owner:change-password] failed", err.message);
    res.status(500).json({ message: "Could not change password", error: err.message });
  }
});

export default router;
