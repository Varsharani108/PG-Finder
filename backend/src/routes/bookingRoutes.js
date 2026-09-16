import { Router } from "express";
import Booking from "../models/Booking.js";
import Property, { calculatePricingBreakdown } from "../models/Property.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/createNotification.js";

const router = Router();
const roomLabels = { single: "Single Sharing", double: "Double Sharing", triple: "Triple Sharing", "4+": "4+ Sharing" };
let Stripe;
try {
  ({ default: Stripe } = await import("stripe"));
} catch {
  Stripe = null;
}
const stripe = process.env.STRIPE_SECRET_KEY && Stripe ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function validateBookingInput(body, property) {
  const roomType = body.roomType || property.roomType;
  if (!roomType || roomType !== property.roomType) throw Object.assign(new Error("Please select a valid room type."), { statusCode: 400 });
  if (body.moveInDate && (Number.isNaN(new Date(body.moveInDate).getTime()) || new Date(body.moveInDate) < new Date(new Date().setHours(0, 0, 0, 0)))) throw Object.assign(new Error("Move-in date must be today or a future date."), { statusCode: 400 });
  const occupants = Number(body.occupants || 1);
  const maxOccupants = roomType === "single" ? 1 : roomType === "double" ? 2 : roomType === "triple" ? 3 : 4;
  if (!Number.isInteger(occupants) || occupants < 1 || occupants > maxOccupants) throw Object.assign(new Error(`Occupants must be between 1 and ${maxOccupants}.`), { statusCode: 400 });
  return { roomType, occupants };
}

async function getActiveProperty(propertyId) {
  const property = await Property.findOne({ _id: propertyId, verificationStatus: "verified", status: "active" });
  if (!property) throw Object.assign(new Error("Active property not found."), { statusCode: 404 });
  return property;
}

async function rejectDuplicate(propertyId, userId) {
  const existing = await Booking.findOne({ property: propertyId, tenant: userId, status: { $in: ["Pending", "Confirmed", "Active"] } });
  if (existing) throw Object.assign(new Error("You already have an active booking for this property."), { statusCode: 409 });
}

export async function handleStripeWebhook(req, res) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send("Stripe webhook is not configured.");
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const booking = await Booking.findOne({ _id: session.metadata?.bookingId, stripeSessionId: session.id });
    if (booking && booking.paymentStatus !== "paid") {
      const reserved = await Property.findOneAndUpdate({ _id: booking.property, availableRooms: { $gte: 1 } }, { $inc: { availableRooms: -1 } }, { new: true });
      booking.paymentStatus = "paid";
      booking.stripePaymentIntentId = session.payment_intent || "";
      if (reserved) {
        booking.availabilityReserved = true;
        booking.status = "Pending";
      }
      await booking.save();
      if (reserved) await createNotification({ recipient: booking.owner, type: "booking", title: "Online booking received", message: "A Stripe payment was verified and is awaiting your confirmation.", relatedId: booking._id });
    }
  }
  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    await Booking.findOneAndUpdate({ _id: session.metadata?.bookingId, stripeSessionId: session.id }, { paymentStatus: "failed" });
  }
  return res.json({ received: true });
}

function buildBookingData(property, userId, input, breakdown, paymentMethod) {
  return {
    user: userId,
    owner: property.owner,
    property: property._id,
    tenant: userId,
    roomType: input.roomType,
    roomLabel: roomLabels[input.roomType],
    moveInDate: input.moveInDate || undefined,
    rent: breakdown.baseRent,
    amount: breakdown.total,
    occupants: input.occupants,
    securityDeposit: 0,
    priceBreakdown: breakdown,
    paymentMethod,
    paymentStatus: "pending",
    status: paymentMethod === "cash" ? "Pending" : "Pending",
    bookingDate: new Date(),
  };
}

router.use(protect, authorize("user"));

router.get("/checkout/:propertyId", async (req, res) => {
  try {
    const property = await getActiveProperty(req.params.propertyId);
    if (!(property.availableRooms > 0)) return res.status(409).json({ message: "No rooms are currently available." });
    res.json({ property, pricing: calculatePricingBreakdown(property), room: { type: property.roomType, label: roomLabels[property.roomType], available: property.availableRooms, total: property.totalRooms } });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Could not load checkout details." });
  }
});

router.get("/my", async (req, res) => {
  const bookings = await Booking.find({ tenant: req.user._id }).populate("property", "name location city area images roomType").sort({ createdAt: -1 });
  res.json(bookings);
});

router.get("/:id", async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, tenant: req.user._id }).populate("property", "name location city area images roomType");
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  res.json(booking);
});

router.post("/cash", async (req, res) => {
  try {
    const property = await getActiveProperty(req.body.property);
    const input = validateBookingInput(req.body, property);
    await rejectDuplicate(property._id, req.user._id);
    const breakdown = calculatePricingBreakdown(property);
    const reservedProperty = await Property.findOneAndUpdate({ _id: property._id, availableRooms: { $gte: 1 } }, { $inc: { availableRooms: -1 } }, { new: true });
    if (!reservedProperty) return res.status(409).json({ message: "This room was just booked. Please choose another property." });
    const booking = await Booking.create({ ...buildBookingData(property, req.user._id, { ...req.body, ...input }, breakdown, "cash"), availabilityReserved: true });
    await createNotification({ recipient: property.owner, type: "booking", title: "New booking received", message: `${req.user.name} booked ${property.name} with payment at property.`, relatedId: booking._id });
    await createNotification({ recipient: req.user._id, type: "booking", title: "Booking received", message: `Your booking for ${property.name} is pending owner confirmation.`, relatedId: booking._id });
    res.status(201).json({ booking });
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message || "Could not create booking." });
  }
});

router.post("/stripe-session", async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ message: "Online payment is not configured. Choose Cash / Pay at Property." });
    const property = await getActiveProperty(req.body.property);
    const input = validateBookingInput(req.body, property);
    await rejectDuplicate(property._id, req.user._id);
    const breakdown = calculatePricingBreakdown(property);
    const booking = await Booking.create(buildBookingData(property, req.user._id, { ...req.body, ...input }, breakdown, "stripe"));
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price_data: { currency: "inr", product_data: { name: `${property.name} - ${roomLabels[input.roomType]}` }, unit_amount: Math.round(breakdown.total * 100) }, quantity: 1 }],
      customer_email: req.user.email,
      success_url: `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/booking-confirmation/${booking._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/checkout/${property._id}?cancelled=true`,
      metadata: { bookingId: String(booking._id) },
    });
    booking.stripeSessionId = session.id;
    await booking.save();
    res.status(201).json({ checkoutUrl: session.url, bookingId: booking._id });
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message || "Could not start online payment." });
  }
});

router.get("/:id/payment-status", async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, tenant: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found." });
    if (booking.paymentMethod !== "stripe" || !stripe || !req.query.session_id) return res.json({ booking });
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    if (session.metadata?.bookingId !== String(booking._id)) return res.status(400).json({ message: "Payment session does not match this booking." });
    if (session.payment_status === "paid" && booking.paymentStatus !== "paid") {
      const reservedProperty = await Property.findOneAndUpdate({ _id: booking.property, availableRooms: { $gte: 1 } }, { $inc: { availableRooms: -1 } }, { new: true });
      if (!reservedProperty) {
        booking.paymentStatus = "paid";
        booking.status = "Pending";
        await booking.save();
        return res.status(409).json({ message: "Payment succeeded, but no room remains. Contact support for a refund." });
      }
      booking.paymentStatus = "paid";
      booking.status = "Pending";
      booking.availabilityReserved = true;
      booking.stripePaymentIntentId = session.payment_intent || "";
      await booking.save();
    }
    res.json({ booking });
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not verify payment." });
  }
});

export default router;