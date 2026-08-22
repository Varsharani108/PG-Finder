import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "owner", "admin"],
      default: "user",
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: function defaultVerificationStatus() {
        return this.role === "owner" ? "pending" : "verified";
      },
    },
    rejectionReason: { type: String, trim: true, default: "" },
    isSuspended: { type: Boolean, default: false },
    ownerStatus: {
      type: String,
      enum: ["Pending", "Approved", "Suspended"],
      default: "Approved",
    },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
    recentSearches: [{
      query: { type: String, trim: true, maxlength: 160, default: "" },
      location: { type: String, trim: true, maxlength: 160, default: "" },
      filters: { type: mongoose.Schema.Types.Mixed, default: {} },
      createdAt: { type: Date, default: Date.now },
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    verificationStatus: this.verificationStatus || (this.role === "owner" ? "pending" : "verified"),
    rejectionReason: this.rejectionReason || "",
    isVerified: this.isVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model("User", userSchema);
