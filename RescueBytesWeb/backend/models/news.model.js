import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["normal", "medium", "high"],
      default: "normal",
    },
    // Added rescueCenter foreign key field
    rescueCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RescueCenter",
      required: true,
    },
  },
  { timestamps: true }
);

const News = mongoose.model("News", newsSchema);

export default News;
