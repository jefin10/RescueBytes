import express from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import DangerZone from "../models/dangerZone.model.js";
import CommunityReport from "../models/communityReport.model.js";
import { computeRiskScore } from "../services/riskScoreService.js";
import { computeEcoScore } from "../services/ecoScoreService.js";

const router = express.Router();
const ORS_BASE = "https://api.openrouteservice.org/v2/directions/driving-car";

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const gemini = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

// Sample N evenly-spaced points along a coordinate array
function sampleWaypoints(coords, n = 5) {
  if (!coords || coords.length === 0) return [];
  if (coords.length <= n) return coords;
  const step = Math.floor(coords.length / n);
  return Array.from({ length: n }, (_, i) => coords[Math.min(i * step, coords.length - 1)]);
}

const PRIORITY_WEIGHTS = {
  safe: { safety: 0.80, eco: 0.20 },
  eco: { safety: 0.30, eco: 0.70 },
  balanced: { safety: 0.65, eco: 0.35 },
};

// POST /safeRoute
router.post("/", async (req, res) => {
  const { origin, destination, vehicleType = "car_petrol", priority = "balanced" } = req.body;

  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return res.status(400).json({ message: "origin and destination with lat/lng are required" });
  }

  const orsApiKey = process.env.ORS_API_KEY;
  if (!orsApiKey) {
    return res.status(500).json({ message: "ORS_API_KEY not configured on server" });
  }

  try {
    // Pre-fetch active zones + approved reports ONCE per request (instead of per waypoint)
    const [activeZones, communityReports] = await Promise.all([
      DangerZone.find({ isActive: true }),
      CommunityReport.find({ approved: true }),
    ]);

    // Call ORS GeoJSON endpoint for up to 3 alternatives with elevation + waycategory extras
    const orsRes = await axios.post(
      ORS_BASE + "/geojson",
      {
        coordinates: [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat],
        ],
        elevation: true,
        alternative_routes: { share_factor: 0.6, target_count: 3 },
        instructions: true,
        extra_info: ["waycategory"],
        geometry_simplify: false,
      },
      {
        headers: {
          Authorization: orsApiKey,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const features = orsRes.data.features || [];
    const weights = PRIORITY_WEIGHTS[priority] || PRIORITY_WEIGHTS.balanced;

    const scoredRoutes = await Promise.all(
      features.map(async (feature) => {
        const geometry = feature.geometry || { coordinates: [] };
        const props = feature.properties || {};
        const coords = geometry.coordinates || [];

        // Sample waypoints and run safety scoring in parallel
        const waypoints = sampleWaypoints(coords, 5);
        const riskResults = await Promise.all(
          waypoints.map(([lng, lat]) =>
            computeRiskScore(lat, lng, { activeZones, communityReports })
          )
        );

        const avgSafetyScore = riskResults.length
          ? Math.round(riskResults.reduce((s, r) => s + r.score, 0) / riskResults.length)
          : 0;

        // Collect all hazards from waypoints (deduplicate)
        const hazardMap = new Map();
        for (const r of riskResults) {
          for (const h of r.nearbyHazards) {
            const key = h.title || h.description || h.type;
            if (!hazardMap.has(key)) hazardMap.set(key, h);
          }
        }
        const hazards = Array.from(hazardMap.values());

        // Eco score on entire feature
        const ecoResult = computeEcoScore(feature, vehicleType);

        const combinedScore = Math.round(
          avgSafetyScore * weights.safety + ecoResult.ecoScore * weights.eco
        );

        // Coverage warning: high % of unpaved/track from waycategory summary
        const wcSummary = props.extras?.waycategory?.summary || [];
        const poorAmount = wcSummary
          .filter((e) => e.value === 8 || e.value === 16) // unpaved or track
          .reduce((sum, e) => sum + (e.amount || 0), 0);
        const poorCoverage = poorAmount > 30;

        return {
          geometry,
          distance_m: props.summary?.distance || 0,
          duration_s: props.summary?.duration || 0,
          safetyScore: avgSafetyScore,
          ecoScore: ecoResult.ecoScore,
          combinedScore,
          estimatedCO2_kg: ecoResult.estimatedCO2_kg,
          elevationGain_m: ecoResult.elevationGain_m,
          stopCount: ecoResult.stopCount,
          naqiBand: riskResults[0]?.naqiBand || "Unknown",
          naqiColor: riskResults[0]?.naqiColor || "grey",
          hazards,
          poorCoverage,
        };
      })
    );

    scoredRoutes.sort((a, b) => a.combinedScore - b.combinedScore);

    res.json({ routes: scoredRoutes, vehicleType, priority });
  } catch (err) {
    console.error("safeRoute error:", err.message);
    const status = err.response?.status || 500;
    const detail = err.response?.data || err.message;
    res.status(status).json({ message: "Failed to compute safe route", error: detail });
  }
});

// POST /safeRoute/explain — Gemini natural language explanation for top route
router.post("/explain", async (req, res) => {
  if (!gemini) {
    return res.status(500).json({ message: "GEMINI_API_KEY not configured" });
  }

  const {
    safetyScore = 0, ecoScore = 0, estimatedCO2_kg = 0, elevationGain_m = 0,
    naqiBand = "Unknown", hazards = [], distance_m = 0, duration_s = 0,
  } = req.body;

  const distanceKm = (distance_m / 1000).toFixed(1);
  const durationMin = Math.round(duration_s / 60);
  const hazardSummary = hazards.length
    ? hazards.map((h) =>
        h.type === "danger_zone"
          ? `Admin-declared ${h.zoneType || "danger"} zone (${h.severity || "unknown"})`
          : `Community report: ${h.description || "hazard reported"}`
      ).join("; ")
    : "no significant hazards detected";

  const prompt = `You are a disaster-aware navigation assistant in India. Summarize this route in 2-3 sentences for a traveller:
- Distance: ${distanceKm} km, ~${durationMin} min
- Safety score: ${safetyScore}/100 (0=safest)
- Eco score: ${ecoScore}/100 (0=greenest)
- Estimated CO2: ${estimatedCO2_kg} kg
- Elevation gain: ${elevationGain_m}m
- Air quality (NAQI): ${naqiBand}
- Hazards along route: ${hazardSummary}
Be concise, practical, and mention any critical hazards. Suggest best time to travel if AQI is poor. No greeting, just the analysis.`;

  try {
    const result = await gemini.generateContent(prompt);
    res.json({ explanation: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate explanation", error: err.message });
  }
});

export default router;
