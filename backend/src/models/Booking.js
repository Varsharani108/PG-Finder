import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomType: { type: String, trim: true, default: "" },
    roomLabel: { type: String, trim: true, default: "" },
    moveInDate: { type: Date },
    rent: { type: Number, min: 0, default: 0 },
    bookingDate: { type: Date, default: Date.now },
    occupants: { type: Number, min: 1, default: 1 },
    amount: { type: Number, min: 0, default: 0 },
    securityDeposit: { type: Number, min: 0, default: 0 },
    priceBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
    paymentMethod: { type: String, enum: ["cash", "stripe"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    stripeSessionId: { type: String, index: true, sparse: true },
    stripePaymentIntentId: { type: String, default: "" },
    availabilityReserved: { type: Boolean, default: false },
    status: { type: String, enum: ["Pending", "Confirmed", "Rejected", "Cancelled", "Active", "Completed"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
