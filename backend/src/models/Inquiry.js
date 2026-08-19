import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ["New", "Viewed", "Replied", "Closed"], default: "New" },
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);
