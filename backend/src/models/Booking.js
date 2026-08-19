import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    moveInDate: { type: Date },
    rent: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["Pending", "Confirmed", "Active", "Completed", "Cancelled"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
