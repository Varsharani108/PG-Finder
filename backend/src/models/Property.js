import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 160,
    },
    rooms: {
      type: Number,
      required: [true, "Number of rooms is required"],
      min: 1,
    },
    price: {
      type: String,
      required: [true, "Price range is required"],
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Rejected", "Suspended", "Draft"],
      default: "Pending",
    },
    moderationReason: { type: String, trim: true, maxlength: 500, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    occupancy: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
