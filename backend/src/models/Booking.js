import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    moveInDate: { type: Date },
    rent: { type: Number, min: 0, default: 0 },
    bookingDate: { type: Date, default: Date.now },
    occupants: { type: Number, min: 1, default: 1 },
    amount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["Pending", "Confirmed", "Rejected", "Cancelled", "Active", "Completed"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
