import { Router } from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Property from "../models/Property.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { refreshPropertyRating } from "../utils/reviewAggregates.js";

const router = Router();
const pageLimit = 10;

function publicPropertyFilter(id) {
  return { _id: id, verificationStatus: "verified", status: "active" };
}

router.get("/property/:propertyId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.propertyId)) return res.status(404).json({ message: "Property not found" });
    const property = await Property.findOne(publicPropertyFilter(req.params.propertyId)).select("_id").lean();
    if (!property) return res.status(404).json({ message: "Property not found" });
    const page = Math.max(1, Number.parseInt(req.query.page || "1", 10));
    const limit = Math.min(pageLimit, Math.max(1, Number.parseInt(req.query.limit || String(pageLimit), 10)));
    const sort = req.query.sort === "highest" ? { rating: -1, createdAt: -1 } : req.query.sort === "lowest" ? { rating: 1, createdAt: -1 } : { createdAt: -1 };
    const filter = { property: property._id };
    const [reviews, total, distribution] = await Promise.all([
      Review.find(filter).populate("tenant", "name").sort(sort).skip((page - 1) * limit).limit(limit).select("rating comment createdAt tenant").lean(),
      Review.countDocuments(filter),
      Review.aggregate([{ $match: filter }, { $group: { _id: "$rating", count: { $sum: 1 } } }]),
    ]);
    const average = total ? distribution.reduce((sum, item) => sum + item._id * item.count, 0) / total : null;
    res.json({ reviews, summary: { average: average === null ? null : Number(average.toFixed(1)), total, distribution: Object.fromEntries(distribution.map((item) => [item._id, item.count])) }, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[reviews:list] failed", error.message);
    res.status(500).json({ message: "Unable to load reviews." });
  }
});

router.use(protect, authorize("user"));

router.post("/", async (req, res) => {
  try {
    const { property, rating, comment } = req.body;
    if (!mongoose.isValidObjectId(property)) return res.status(400).json({ message: "A valid property is required." });
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
    if (typeof comment !== "string" || comment.trim().length < 10 || comment.trim().length > 1000) return res.status(400).json({ message: "Review must contain between 10 and 1000 characters." });
    const listing = await Property.findOne(publicPropertyFilter(property)).select("_id").lean();
    if (!listing) return res.status(404).json({ message: "Active property not found." });
    const existing = await Review.findOne({ property: listing._id, tenant: req.user._id }).select("_id").lean();
    if (existing) return res.status(409).json({ message: "You have already reviewed this PG. Edit your existing review instead." });
    const review = await Review.create({ property: listing._id, tenant: req.user._id, rating: numericRating, comment: comment.trim() });
    await refreshPropertyRating(listing._id);
    res.status(201).json({ review });
  } catch (error) {
    console.error("[reviews:create] failed", error.message);
    res.status(400).json({ message: "Unable to submit review." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const numericRating = Number(req.body.rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) return res.status(400).json({ message: "Rating must be a whole number from 1 to 5." });
    if (typeof req.body.comment !== "string" || req.body.comment.trim().length < 10 || req.body.comment.trim().length > 1000) return res.status(400).json({ message: "Review must contain between 10 and 1000 characters." });
    const review = await Review.findOneAndUpdate({ _id: req.params.id, tenant: req.user._id }, { rating: numericRating, comment: req.body.comment.trim() }, { new: true, runValidators: true }).select("property rating comment createdAt");
    if (!review) return res.status(404).json({ message: "Review not found." });
    await refreshPropertyRating(review.property);
    res.json({ review });
  } catch {
    res.status(400).json({ message: "Unable to update review." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, tenant: req.user._id });
    if (!review) return res.status(404).json({ message: "Review not found." });
    await refreshPropertyRating(review.property);
    res.json({ message: "Review deleted." });
  } catch {
    res.status(400).json({ message: "Unable to delete review." });
  }
});

export default router;
