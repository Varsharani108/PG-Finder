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
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
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
    monthlyRent: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    area: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    college: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    roomType: {
      type: String,
      enum: ["single", "double", "triple", "4+"],
    },
    genderPreference: {
      type: String,
      enum: ["male", "female", "co-living"],
      default: "co-living",
    },
    facilities: {
      type: [String],
      default: [],
    },
    food: {
      type: [String],
      default: [],
    },
    foodIncluded: {
      type: Boolean,
      default: false,
    },
    distanceFromCollege: {
      type: Number,
      min: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      min: 0,
    },
    availableRooms: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalRooms: {
      type: Number,
      min: 0,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, trim: true, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    moderationReason: { type: String, trim: true, maxlength: 500, default: "" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
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
