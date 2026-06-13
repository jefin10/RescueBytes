import express from "express";
import axios from "axios";

const router = express.Router();

// GET /geo/autocomplete?text=Kottayam
// Proxies Geoapify autocomplete so the mobile/web client doesn't need the API key.
router.get("/autocomplete", async (req, res) => {
  const { text } = req.query;
  if (!text || text.length < 3) {
    return res.json({ features: [] });
  }

  const key = process.env.LOCATION_API_KEY;
  if (!key) {
    return res.status(500).json({ message: "LOCATION_API_KEY not configured" });
  }

  try {
    const r = await axios.get("https://api.geoapify.com/v1/geocode/autocomplete", {
      params: {
        text,
        apiKey: key,
        limit: 5,
        filter: "countrycode:in",
      },
      timeout: 8000,
    });
    res.json({ features: r.data.features || [] });
  } catch (err) {
    res.status(500).json({ message: "Autocomplete failed", error: err.message });
  }
});

export default router;
