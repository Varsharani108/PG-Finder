import crypto from "crypto";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

const ALLOWED_ROLES = ["user", "owner"];

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email || "");
}

/**
 * POST /api/auth/signup
 */
export async function signup(req, res) {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    const errors = {};
    if (!name || name.trim().length < 2) errors.name = "Full name must be at least 2 characters.";
    if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
    if (!phone || !/^[0-9]{10}$/.test(phone)) errors.phone = "Enter a valid 10-digit phone number.";
    if (!password || password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (confirmPassword !== undefined && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (role && !ALLOWED_ROLES.includes(role)) errors.role = "Invalid role selected.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Please fix the highlighted fields.", errors });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists.",
        errors: { email: "Email already in use." },
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      phone,
      password,
      role: role || "user",
    });

    const token = generateToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("[auth:signup]", err);
    return res.status(500).json({ message: "Could not create account. Please try again." });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !password) {
      return res.status(400).json({ message: "Enter a valid email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Logged in successfully.",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("[auth:login]", err);
    return res.status(500).json({ message: "Could not log in. Please try again." });
  }
}

/**
 * GET /api/auth/profile
 */
export async function getProfile(req, res) {
  return res.status(200).json({ user: req.user.toSafeObject() });
}

export async function updateProfile(req, res) {
  try {
    const { name, email, phone } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters." });
    }
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit phone number." });
    }
    const nextEmail = email === undefined ? req.user.email : email;
    if (!isValidEmail(nextEmail)) return res.status(400).json({ message: "Enter a valid email address." });
    const existing = await User.findOne({ email: nextEmail.toLowerCase(), _id: { $ne: req.user._id } });
    if (existing) return res.status(409).json({ message: "Email is already in use." });
    req.user.name = name.trim();
    req.user.email = nextEmail.toLowerCase();
    req.user.phone = phone;
    await req.user.save();
    return res.json({ message: "Profile updated successfully.", user: req.user.toSafeObject() });
  } catch (err) {
    return res.status(400).json({ message: "Could not update profile.", error: err.message });
  }
}

/**
 * POST /api/auth/forgot-password
 * Always responds with a generic success message so existing emails
 * cannot be enumerated by attackers.
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    const genericResponse = {
      message: "If an account exists for that email, a reset link has been sent.",
    };

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const resetUrl = `${clientOrigin}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your PG Finder password",
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. This link expires in 30 minutes:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    return res.status(200).json(genericResponse);
  } catch (err) {
    console.error("[auth:forgotPassword]", err);
    return res.status(500).json({ message: "Could not process request. Please try again." });
  }
}

/**
 * POST /api/auth/reset-password
 * Body: { token, password, confirmPassword }
 */
export async function resetPassword(req, res) {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is missing." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const newToken = generateToken(user);

    return res.status(200).json({
      message: "Password has been reset successfully.",
      token: newToken,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("[auth:resetPassword]", err);
    return res.status(500).json({ message: "Could not reset password. Please try again." });
  }
}
