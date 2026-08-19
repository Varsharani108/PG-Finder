import mongoose from "mongoose";

// A single source-of-truth document holding the numbers shown in the
// Statistics section of the About page. Kept as one doc (singleton)
// so the frontend can fetch it with a single request.
const statSchema = new mongoose.Schema(
  {
    propertiesListed: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    citiesCovered: { type: Number, default: 0 },
    localServices: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Stat", statSchema);
