import mongoose from "mongoose";

const dangerZoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["flood", "fire", "chemical", "landslide", "other"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Polygon", "Circle"],
        required: true,
      },
      // For Polygon: array of [lng, lat] pairs; for Circle: single [lng, lat]
      coordinates: { type: Array, required: true },
      // Only for Circle type, in meters
      radius: { type: Number, default: null },
    },
    declaredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const DangerZone = mongoose.model("DangerZone", dangerZoneSchema);
export default DangerZone;
