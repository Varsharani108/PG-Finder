import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Verifies the JWT sent in the Authorization header ("Bearer <token>")
 * and attaches the authenticated user to req.user.
 */
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended by the administrator." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired or invalid. Please log in again." });
  }
}

/**
 * Restricts a route to a set of roles, e.g. authorize("admin", "owner").
 * Must be used after `protect`.
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do that." });
    }
    next();
  };
}

export function requireVerifiedOwner(req, res, next) {
  const isVerifiedOwner = req.user?.verificationStatus === "verified" || req.user?.ownerStatus === "Approved";
  if (req.user?.role !== "owner" || !isVerifiedOwner || req.user.isSuspended) {
    return res.status(403).json({ message: "A verified owner account is required for this action." });
  }
  next();
}
