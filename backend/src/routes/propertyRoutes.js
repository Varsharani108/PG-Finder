import { Router } from "express";
import Property from "../models/Property.js";
import { authorize, protect, requireVerifiedOwner } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/public", async (req, res) => {
  try {
    const properties = await Property.find({ verificationStatus: "verified", status: { $ne: "Rejected" } }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Could not load public properties", error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json(await Property.find({ verificationStatus: "verified", status: { $ne: "Rejected" } }).sort({ createdAt: -1 }));
    }
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Could not load your properties", error: err.message });
  }
});

router.post("/", requireVerifiedOwner, async (req, res) => {
  try {
    const { name, location, rooms, price, description } = req.body;
    const property = await Property.create({
      owner: req.user._id,
      name,
      location,
      rooms,
      price,
      description,
      verificationStatus: "pending",
      status: "Pending Verification",
    });
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ message: "Could not save this property", error: err.message });
  }
});

router.put("/:id", requireVerifiedOwner, async (req, res) => {
  try {
    const { name, location, rooms, price, description } = req.body;
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, location, rooms, price, description },
      { new: true, runValidators: true }
    );
    if (!property) return res.status(404).json({ message: "Property not found" });
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
