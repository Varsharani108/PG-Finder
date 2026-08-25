import Review from "../models/Review.js";
import Property from "../models/Property.js";

export async function refreshPropertyRating(propertyId) {
  const [summary] = await Review.aggregate([
    { $match: { property: propertyId } },
    { $group: { _id: "$property", rating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);

  await Property.findByIdAndUpdate(propertyId, summary
    ? { rating: Number(summary.rating.toFixed(1)), reviewCount: summary.reviewCount }
    : { $unset: { rating: 1, reviewCount: 1 } });
}
