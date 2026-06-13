import express from "express";
import DangerZone from "../models/dangerZone.model.js";

const router = express.Router();

// Admin: create a danger zone
router.post("/add", async (req, res) => {
  try {
    const { title, description, type, severity, geometry, expiresAt } = req.body;
    if (!title || !type || !severity || !geometry) {
      return res.status(400).json({ message: "title, type, severity, and geometry are required" });
    }
    const zone = new DangerZone({
      title,
      description,
      type,
      severity,
      geometry,
      declaredBy: req.body.declaredBy || null,
      expiresAt: expiresAt || null,
    });
    await zone.save();
    res.status(201).json({ message: "Danger zone created", zone });
  } catch (err) {
    res.status(500).json({ message: "Error creating danger zone", error: err.message });
  }
});

// Public/mobile: get all currently active zones (auto-deactivate expired)
router.get("/active", async (req, res) => {
  try {
    // Deactivate expired zones on read
    await DangerZone.updateMany(
      { isActive: true, expiresAt: { $ne: null, $lt: new Date() } },
      { isActive: false }
    );
    const zones = await DangerZone.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ zones });
  } catch (err) {
    res.status(500).json({ message: "Error fetching danger zones", error: err.message });
  }
});

// Admin: update a danger zone
router.put("/:id", async (req, res) => {
  try {
    const zone = await DangerZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!zone) return res.status(404).json({ message: "Danger zone not found" });
    res.json({ message: "Danger zone updated", zone });
  } catch (err) {
    res.status(500).json({ message: "Error updating danger zone", error: err.message });
  }
});

// Admin: deactivate (soft-delete) a danger zone
router.delete("/:id", async (req, res) => {
  try {
    const zone = await DangerZone.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!zone) return res.status(404).json({ message: "Danger zone not found" });
    res.json({ message: "Danger zone deactivated", zone });
  } catch (err) {
    res.status(500).json({ message: "Error deactivating danger zone", error: err.message });
  }
});

export default router;
