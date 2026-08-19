import { Router } from "express";
import Property from "../models/Property.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorize("owner"));

router.get("/", async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Could not load your properties", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, location, rooms, price, description } = req.body;
    const property = await Property.create({
      owner: req.user._id,
      name,
      location,
      rooms,
      price,
      description,
      status: "Pending",
    });
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ message: "Could not save this property", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json({ message: "Property deleted" });
  } catch (err) {
    res.status(400).json({ message: "Could not delete this property", error: err.message });
  }
});

export default router;
