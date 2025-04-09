import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rescueCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RescueCenter",
      required: true,
    },
  },
  { timestamps: true }
);

const SOS = mongoose.model("SOS", sosSchema);

export default SOS;
