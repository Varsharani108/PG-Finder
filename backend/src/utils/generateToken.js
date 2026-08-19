import jwt from "jsonwebtoken";

/**
 * Signs a JWT containing the user's id and role.
 * Role lives inside the token so the frontend/middleware can make
 * authorization decisions without an extra DB round trip.
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}
