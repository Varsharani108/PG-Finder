import mongoose from "mongoose";

export const facilityOptions = [
  "Wi-Fi", "AC", "Attached bathroom", "Furniture", "Washing machine", "Parking",
  "Power backup", "Study table", "Gym", "CCTV", "24/7 security", "Housekeeping",
  "Laundry service", "Lift", "Hot water", "RO water", "Common room", "Kitchen",
  "Garden", "Balcony",
];

const foodItemNames = ["breakfast", "lunch", "dinner"];

const toNonNegativeNumber = (value, fallback = 0) => {
  const numeric = Number(value ?? fallback);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, numeric);
};

const createFoodEntry = () => ({
  enabled: false,
  includedInRent: false,
  price: 0,
});

const createDefaultFoodConfig = () => ({
  enabled: false,
  breakfast: createFoodEntry(),
  lunch: createFoodEntry(),
  dinner: createFoodEntry(),
  type: "Vegetarian",
});

export const normalizeFacilities = (value) => {
  if (!Array.isArray(value)) return [];
  const normalized = facilityOptions.map((name) => {
    const match = value.find((item) => {
      if (typeof item === "string") return item === name;
      if (item && typeof item === "object") return item.name === name;
      return false;
    });
    const entry = typeof match === "object" && match !== null ? match : { name, enabled: typeof match === "string", includedInRent: false, price: 0 };
    const enabled = Boolean(entry.enabled);
    const includedInRent = Boolean(entry.includedInRent);
    const price = toNonNegativeNumber(entry.price, 0);
    return {
      name,
      enabled,
      includedInRent,
      price: enabled && !includedInRent ? price : 0,
    };
  });

  const explicit = value.filter((item) => typeof item === "object" && item && typeof item.name === "string" && item.name && !facilityOptions.includes(item.name));
  if (explicit.length) {
    explicit.forEach((item) => {
      const name = String(item.name).trim();
      if (!name) return;
      normalized.push({
        name,
        enabled: Boolean(item.enabled),
        includedInRent: Boolean(item.includedInRent),
        price: toNonNegativeNumber(item.price, 0),
      });
    });
  }

  return normalized.filter((item) => item.name && (item.enabled || item.includedInRent || item.price > 0));
};

export const normalizeFoodConfig = (value, legacyFoodIncluded = false) => {
  const base = { ...createDefaultFoodConfig() };
  const configured = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const legacyEnabled = Boolean(legacyFoodIncluded || configured.enabled);
  base.enabled = legacyEnabled;
  if (configured.type === "Non-vegetarian" || configured.type === "non-vegetarian") {
    base.type = "Non-vegetarian";
  } else if (configured.type === "Vegetarian" || configured.type === "vegetarian") {
    base.type = "Vegetarian";
  }

  foodItemNames.forEach((item) => {
    const entry = configured[item] && typeof configured[item] === "object" ? configured[item] : null;
    base[item] = {
      enabled: Boolean(entry?.enabled || (Array.isArray(value) && value.includes(item))),
      includedInRent: Boolean(entry?.includedInRent),
      price: toNonNegativeNumber(entry?.price, 0),
    };
    if (base[item].enabled && base[item].includedInRent) {
      base[item].price = 0;
    }
  });

  if (Array.isArray(value)) {
    const selected = new Set(value.map((item) => String(item).trim().toLowerCase()));
    if (selected.has("breakfast")) base.breakfast.enabled = true;
    if (selected.has("lunch")) base.lunch.enabled = true;
    if (selected.has("dinner")) base.dinner.enabled = true;
    if (selected.has("vegetarian")) base.type = "Vegetarian";
    if (selected.has("non-vegetarian")) base.type = "Non-vegetarian";
    if (selected.length) base.enabled = true;
  }

  base.foodIncluded = base.enabled;
  return base;
};

export const normalizePropertyPricingFields = (property = {}) => {
  const facilities = normalizeFacilities(Array.isArray(property.facilities) ? property.facilities : []);
  const food = normalizeFoodConfig(property.food, Boolean(property.foodIncluded || property.food?.enabled));
  const facilityNames = facilities.filter((item) => item.enabled).map((item) => item.name);
  const foodOptions = ["breakfast", "lunch", "dinner"].filter((item) => food[item]?.enabled).map((item) => item);

  if (property.food && typeof property.food === "object" && property.food.type) {
    food.type = property.food.type === "Non-vegetarian" ? "Non-vegetarian" : "Vegetarian";
  }

  return {
    facilities,
    food,
    facilityNames,
    foodOptions,
  };
};

export function calculatePropertyTotal(property = {}) {
  const baseRent = toNonNegativeNumber(property.monthlyRent, 0);
  const facilities = normalizeFacilities(Array.isArray(property.facilities) ? property.facilities : []);
  const food = normalizeFoodConfig(property.food, Boolean(property.foodIncluded || property.food?.enabled));

  const facilityTotal = facilities.reduce((total, facility) => {
    if (!facility.enabled || facility.includedInRent) return total;
    return total + toNonNegativeNumber(facility.price, 0);
  }, 0);

  const foodTotal = ["breakfast", "lunch", "dinner"].reduce((total, meal) => {
    const item = food[meal] || { enabled: false, includedInRent: false, price: 0 };
    if (!item.enabled || item.includedInRent) return total;
    return total + toNonNegativeNumber(item.price, 0);
  }, 0);

  return baseRent + facilityTotal + foodTotal;
}

export function calculatePricingBreakdown(property = {}) {
  const baseRent = toNonNegativeNumber(property.monthlyRent, 0);
  const facilities = normalizeFacilities(Array.isArray(property.facilities) ? property.facilities : []);
  const food = normalizeFoodConfig(property.food, Boolean(property.foodIncluded || property.food?.enabled));

  const facilityBreakdown = facilities
    .filter((facility) => facility.enabled)
    .map((facility) => ({
      name: facility.name,
      includedInRent: Boolean(facility.includedInRent),
      price: facility.includedInRent ? 0 : toNonNegativeNumber(facility.price, 0),
    }));

  const foodBreakdown = ["breakfast", "lunch", "dinner"]
    .filter((meal) => food[meal]?.enabled)
    .map((meal) => ({
      name: meal,
      includedInRent: Boolean(food[meal]?.includedInRent),
      price: food[meal]?.includedInRent ? 0 : toNonNegativeNumber(food[meal]?.price, 0),
    }));

  const total = baseRent + facilityBreakdown.reduce((sum, item) => sum + item.price, 0) + foodBreakdown.reduce((sum, item) => sum + item.price, 0);

  return {
    baseRent,
    facilities: facilityBreakdown,
    food: foodBreakdown,
    total,
  };
}

const facilityPriceSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    enabled: { type: Boolean, default: false },
    includedInRent: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const foodItemPriceSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    includedInRent: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const foodPricingSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    breakfast: { type: foodItemPriceSchema, default: createFoodEntry },
    lunch: { type: foodItemPriceSchema, default: createFoodEntry },
    dinner: { type: foodItemPriceSchema, default: createFoodEntry },
    type: { type: String, enum: ["Vegetarian", "Non-vegetarian"], default: "Vegetarian" },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: 120,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: 160,
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    rooms: {
      type: Number,
      required: [true, "Number of rooms is required"],
      min: 1,
    },
    price: {
      type: String,
      required: [true, "Price range is required"],
      trim: true,
      maxlength: 80,
    },
    monthlyRent: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    area: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    college: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    roomType: {
      type: String,
      enum: ["single", "double", "triple", "4+"],
    },
    genderPreference: {
      type: String,
      enum: ["male", "female", "co-living"],
      default: "co-living",
    },
    facilities: {
      type: [facilityPriceSchema],
      default: [],
    },
    facilityNames: {
      type: [String],
      default: [],
    },
    food: {
      type: foodPricingSchema,
      default: createDefaultFoodConfig,
    },
    foodOptions: {
      type: [String],
      default: [],
    },
    foodIncluded: {
      type: Boolean,
      default: false,
    },
    distanceFromCollege: {
      type: Number,
      min: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      min: 0,
    },
    availableRooms: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalRooms: {
      type: Number,
      min: 0,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, trim: true, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    moderationReason: { type: String, trim: true, maxlength: 500, default: "" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    occupancy: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

propertySchema.pre("save", function normalizePricing(next) {
  const normalized = normalizePropertyPricingFields(this.toObject({ virtuals: false }));
  this.facilities = normalized.facilities;
  this.food = normalized.food;
  this.facilityNames = normalized.facilityNames;
  this.foodOptions = normalized.foodOptions;
  this.foodIncluded = Boolean(this.food?.enabled || this.foodIncluded);
  next();
});

propertySchema.methods.calculatePricingBreakdown = function calculatePricingBreakdownForDocument() {
  return calculatePricingBreakdown(this.toObject({ virtuals: false }));
};

propertySchema.statics.calculatePropertyTotal = function calculatePropertyTotalForDocument(value) {
  return calculatePropertyTotal(value);
};

export default mongoose.model("Property", propertySchema);
