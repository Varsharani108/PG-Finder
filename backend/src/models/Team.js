import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    // founder | developer | mentor
    group: {
      type: String,
      enum: ["founder", "developer", "mentor"],
      default: "developer",
    },
    bio: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
