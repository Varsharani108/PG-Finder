import { Router } from "express";
import Property from "../models/Property.js";
import { authorize, protect, requireVerifiedOwner } from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/createNotification.js";

const router = Router();

const publicFields = [
  "_id",
  "name",
  "description",
  "location",
  "latitude",
  "longitude",
  "city",
  "area",
  "college",
  "price",
  "monthlyRent",
  "rooms",
  "roomType",
  "genderPreference",
  "facilities",
  "food",
  "foodIncluded",
  "distanceFromCollege",
  "rating",
  "reviewCount",
  "availableRooms",
  "totalRooms",
  "images",
  "createdAt",
  "updatedAt",
];

const roomTypes = new Set(["single", "double", "triple", "4+"]);
const sortValues = new Set(["recommended", "lowest", "highest_rating", "nearest", "most_reviewed"]);
const genderPreferences = new Set(["male", "female", "co-living"]);
const foodOptions = new Set(["breakfast", "lunch", "dinner", "vegetarian", "non-vegetarian"]);

function validatePropertyPayload(payload, { partial = false } = {}) {
  const requiredFields = ["name", "city", "area", "location"];
  if (!partial) {
    const missing = requiredFields.find((field) => !String(payload[field] || "").trim());
    if (missing) throw Object.assign(new Error(`${missing} is required.`), { statusCode: 400 });
  }
  if (!partial) {
    if (!Number.isFinite(Number(payload.monthlyRent)) || Number(payload.monthlyRent) <= 0) throw Object.assign(new Error("Monthly rent must be greater than 0."), { statusCode: 400 });
    if (!Number.isInteger(Number(payload.totalRooms)) || Number(payload.totalRooms) <= 0) throw Object.assign(new Error("Total rooms must be a positive whole number."), { statusCode: 400 });
    if (!Number.isInteger(Number(payload.availableRooms)) || Number(payload.availableRooms) < 0) throw Object.assign(new Error("Available rooms must be a non-negative whole number."), { statusCode: 400 });
    if (!payload.roomType) throw Object.assign(new Error("Room type is required."), { statusCode: 400 });
  }
  if (payload.monthlyRent !== undefined && (!Number.isFinite(Number(payload.monthlyRent)) || Number(payload.monthlyRent) <= 0)) {
    throw Object.assign(new Error("Monthly rent must be greater than 0."), { statusCode: 400 });
  }
  for (const field of ["rooms", "totalRooms", "availableRooms"]) {
    if (payload[field] !== undefined && (!Number.isInteger(Number(payload[field])) || Number(payload[field]) < 0 || (field === "rooms" && Number(payload[field]) < 1))) {
      throw Object.assign(new Error(`${field} must be a valid non-negative whole number.`), { statusCode: 400 });
    }
  }
  if (payload.totalRooms !== undefined && payload.availableRooms !== undefined && Number(payload.availableRooms) > Number(payload.totalRooms)) {
    throw Object.assign(new Error("Available rooms cannot exceed total rooms."), { statusCode: 400 });
  }
  if (payload.roomType !== undefined && !roomTypes.has(payload.roomType)) throw Object.assign(new Error("Invalid room type."), { statusCode: 400 });
  if (payload.genderPreference !== undefined && !genderPreferences.has(payload.genderPreference)) throw Object.assign(new Error("Invalid gender preference."), { statusCode: 400 });
  if (payload.distanceFromCollege !== undefined && payload.distanceFromCollege !== "" && (!Number.isFinite(Number(payload.distanceFromCollege)) || Number(payload.distanceFromCollege) < 0)) throw Object.assign(new Error("Distance must be a non-negative number."), { statusCode: 400 });
  for (const field of ["latitude", "longitude"]) {
    if (payload[field] !== undefined && payload[field] !== "" && !Number.isFinite(Number(payload[field]))) throw Object.assign(new Error(`${field} must be a valid number.`), { statusCode: 400 });
  }
  const hasLatitude = payload.latitude !== undefined && payload.latitude !== "" && payload.latitude !== null;
  const hasLongitude = payload.longitude !== undefined && payload.longitude !== "" && payload.longitude !== null;
  if (hasLatitude !== hasLongitude) throw Object.assign(new Error("Latitude and longitude must be provided together."), { statusCode: 400 });
  if (payload.latitude !== undefined && payload.latitude !== "" && (Number(payload.latitude) < -90 || Number(payload.latitude) > 90)) throw Object.assign(new Error("Latitude must be between -90 and 90."), { statusCode: 400 });
  if (payload.longitude !== undefined && payload.longitude !== "" && (Number(payload.longitude) < -180 || Number(payload.longitude) > 180)) throw Object.assign(new Error("Longitude must be between -180 and 180."), { statusCode: 400 });
  if (payload.facilities !== undefined && (!Array.isArray(payload.facilities) || payload.facilities.some((value) => typeof value !== "string"))) throw Object.assign(new Error("Facilities must be an array of text values."), { statusCode: 400 });
  if (payload.food !== undefined && (!Array.isArray(payload.food) || payload.food.some((value) => !foodOptions.has(value)))) throw Object.assign(new Error("Food options are invalid."), { statusCode: 400 });
  if (payload.images !== undefined && (!Array.isArray(payload.images) || payload.images.some((value) => typeof value !== "string" || (value && !/^https?:\/\//i.test(value))))) throw Object.assign(new Error("Images must contain valid URLs."), { statusCode: 400 });
}

function queryValues(value) {
  if (Array.isArray(value)) return value.flatMap((item) => String(item).split(",")).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function parseNumber(value, field, { integer = false } = {}) {
  if (value === undefined || value === "") return undefined;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || (integer && !Number.isInteger(number))) {
    const error = new Error(`${field} must be a non-negative ${integer ? "integer" : "number"}.`);
    error.statusCode = 400;
    throw error;
  }
  return number;
}

function parseDistance(value) {
  if (value === undefined || value === "" || value === "any") return undefined;
  const text = String(value).trim().toLowerCase();
  const match = text.match(/^(\d+(?:\.\d+)?)\s*(m|km)?$/);
  if (!match) {
    const error = new Error("distance must be a value such as 500m, 1km, 2km, or any.");
    error.statusCode = 400;
    throw error;
  }
  const distance = Number(match[1]) * (match[2] === "km" ? 1000 : 1);
  return parseNumber(distance, "distance");
}

function parseBoolean(value, field) {
  if (value === undefined || value === "") return undefined;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  const error = new Error(`${field} must be true or false.`);
  error.statusCode = 400;
  throw error;
}

function publicProjection() {
  return Object.fromEntries(publicFields.map((field) => [field, 1]));
}

function publicSearchPipeline(query) {
  const {
    search,
    minPrice,
    maxPrice,
    roomType,
    facilities,
    food,
    foodIncluded,
    distance,
    minRating,
    minReviewCount,
    sort = "recommended",
  } = query;
  const filter = { verificationStatus: "verified", status: "active" };

  if (search) {
    const escapedSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["name", "location", "area", "city", "college"].map((field) => ({
      [field]: { $regex: escapedSearch, $options: "i" },
    }));
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.monthlyRent = {};
    if (minPrice !== undefined) filter.monthlyRent.$gte = minPrice;
    if (maxPrice !== undefined) filter.monthlyRent.$lte = maxPrice;
  }
  if (roomType) filter.roomType = roomType;
  if (facilities.length) filter.facilities = { $all: facilities };
  if (food.length) filter.food = { $all: food };
  if (foodIncluded !== undefined) filter.foodIncluded = foodIncluded;
  if (distance !== undefined) filter.distanceFromCollege = { $exists: true, $lte: distance };
  if (minRating !== undefined) filter.rating = { $exists: true, $gte: minRating };
  if (minReviewCount !== undefined) filter.reviewCount = { $exists: true, $gte: minReviewCount };

  const pipeline = [{ $match: filter }];
  if (sort === "lowest") {
    pipeline.push({ $set: { _sortPrice: { $cond: [{ $isNumber: "$monthlyRent" }, "$monthlyRent", Number.MAX_SAFE_INTEGER] } } });
    pipeline.push({ $sort: { _sortPrice: 1, createdAt: -1 } });
  } else if (sort === "nearest") {
    pipeline.push({ $set: { _sortDistance: { $cond: [{ $isNumber: "$distanceFromCollege" }, "$distanceFromCollege", Number.MAX_SAFE_INTEGER] } } });
    pipeline.push({ $sort: { _sortDistance: 1, createdAt: -1 } });
  } else if (sort === "highest_rating") {
    pipeline.push({ $sort: { rating: -1, reviewCount: -1, createdAt: -1 } });
  } else if (sort === "most_reviewed") {
    pipeline.push({ $sort: { reviewCount: -1, rating: -1, createdAt: -1 } });
  } else {
    pipeline.push({ $sort: { rating: -1, reviewCount: -1, createdAt: -1 } });
  }
  return pipeline;
}

router.get("/public", async (req, res) => {
  try {
    const page = parseNumber(req.query.page || 1, "page", { integer: true });
    const limit = parseNumber(req.query.limit || 12, "limit", { integer: true });
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: "page must be at least 1 and limit must be between 1 and 100." });
    }
   const foodOptions = new Set(["breakfast", "lunch", "dinner", "vegetarian", "non-vegetarian"]);
    const minPrice = parseNumber(req.query.minPrice, "minPrice");
    const maxPrice = parseNumber(req.query.maxPrice, "maxPrice");
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return res.status(400).json({ message: "minPrice cannot be greater than maxPrice." });
    }
    const minRating = parseNumber(req.query.minRating, "minRating");
    if (minRating !== undefined && minRating > 5) return res.status(400).json({ message: "minRating cannot be greater than 5." });
    const minReviewCount = parseNumber(req.query.minReviewCount, "minReviewCount", { integer: true });
    const roomType = req.query.roomType;
    if (roomType && !roomTypes.has(roomType)) return res.status(400).json({ message: "Invalid roomType." });
    const sort = req.query.sort || "recommended";
    if (!sortValues.has(sort)) return res.status(400).json({ message: "Invalid sort value." });

    const pipeline = publicSearchPipeline({
      search: req.query.search,
      minPrice,
      maxPrice,
      roomType,
      facilities: queryValues(req.query.facilities),
      food: queryValues(req.query.food),
      foodIncluded: parseBoolean(req.query.foodIncluded, "foodIncluded"),
      distance: parseDistance(req.query.distance),
      minRating,
      minReviewCount,
      sort,
    });
    pipeline.push({
      $facet: {
        properties: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $project: publicProjection() },
        ],
        metadata: [{ $count: "total" }],
      },
    });
    const [result] = await Property.aggregate(pipeline).allowDiskUse(true);
    const total = result?.metadata[0]?.total || 0;
    if (Object.keys(req.query).length === 0) {
      return res.json(result?.properties || []);
    }
    res.json({
      properties: result?.properties || [],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: statusCode === 500 ? "Could not load public properties" : err.message });
  }
});

router.get("/public/:id", async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      verificationStatus: "verified",
      status: "active",
    })
      .select(publicFields.join(" "))
      .lean();
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch {
    res.status(404).json({ message: "Property not found" });
  }
});

router.use(protect);

router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json(await Property.find({ verificationStatus: "verified", status: "active" }).sort({ createdAt: -1 }));
    }
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Could not load your properties", error: err.message });
  }
});

router.post("/", requireVerifiedOwner, async (req, res) => {
  try {
    validatePropertyPayload(req.body);
    const {
      name,
      location,
      latitude,
      longitude,
      rooms,
      price,
      monthlyRent,
      description,
      city,
      area,
      college,
      roomType,
      genderPreference,
      facilities,
      food,
      foodIncluded,
      distanceFromCollege,
      rating,
      reviewCount,
      availableRooms,
      totalRooms,
      images,
    } = req.body;
    const property = await Property.create({
      owner: req.user._id,
      name,
      location,
      latitude,
      longitude,
      rooms,
      price,
      monthlyRent,
      description,
      city,
      area,
      college,
      roomType,
      genderPreference,
      facilities,
      food,
      foodIncluded,
      distanceFromCollege,
      rating,
      reviewCount,
      availableRooms,
      totalRooms,
      images,
      verificationStatus: "pending",
      status: "inactive",
    });
    await createNotification({ recipient: req.user._id, type: "property", title: "Property submitted", message: `${property.name} was submitted for verification.`, relatedId: property._id });
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ message: "Could not save this property", error: err.message });
  }
});

router.put("/:id", requireVerifiedOwner, async (req, res) => {
  try {
    validatePropertyPayload(req.body, { partial: true });
    const editableFields = [
      "name",
      "location",
      "latitude",
      "longitude",
      "rooms",
      "price",
      "monthlyRent",
      "description",
      "city",
      "area",
      "college",
      "roomType",
      "genderPreference",
      "facilities",
      "food",
      "foodIncluded",
      "distanceFromCollege",
      "rating",
      "reviewCount",
      "availableRooms",
      "totalRooms",
      "images",
    ];
    const propertyData = Object.fromEntries(
      editableFields
        .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]])
    );
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ message: "Property not found" });
    validatePropertyPayload({ ...property.toObject(), ...propertyData }, { partial: true });
    const wasRejected = property.verificationStatus === "rejected";
    Object.assign(property, propertyData);
    if (wasRejected) {
      property.verificationStatus = "pending";
      property.status = "inactive";
      property.rejectionReason = "";
      property.moderationReason = "";
      property.reviewedBy = undefined;
      property.reviewedAt = undefined;
      property.verifiedBy = undefined;
      property.verifiedAt = undefined;
    }
    await property.save();
    if (wasRejected) await createNotification({ recipient: req.user._id, type: "property", title: "Property resubmitted", message: `${property.name} was resubmitted for verification.`, relatedId: property._id });
    res.json(property);
  } catch (err) {
    res.status(400).json({ message: "Could not update this property", error: err.message });
  }
});

router.delete("/:id", requireVerifiedOwner, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json({ message: "Property deleted" });
  } catch (err) {
    res.status(400).json({ message: "Could not delete this property", error: err.message });
  }
});

export default router;
