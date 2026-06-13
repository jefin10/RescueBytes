import axios from "axios";
import DangerZone from "../models/dangerZone.model.js";
import CommunityReport from "../models/communityReport.model.js";
import { fetchAQI } from "./aqiService.js";

const WEATHER_CACHE = new Map();
const WEATHER_TTL_MS = 30 * 60 * 1000; // 30 min

async function fetchWeatherRisk(lat, lng) {
  const key = `${Math.round(lat * 10) / 10}_${Math.round(lng * 10) / 10}`;
  const cached = WEATHER_CACHE.get(key);
  if (cached && Date.now() - cached.fetchedAt < WEATHER_TTL_MS) return cached.data;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation,wind_speed_10m&forecast_days=1&timezone=auto`;
    const res = await axios.get(url, { timeout: 8000 });
    const h = res.data.hourly;
    const hour = new Date().getHours();
    const precipitation = h.precipitation?.[hour] ?? 0;
    const windSpeed = h.wind_speed_10m?.[hour] ?? 0;

    // >10mm/h rain or >50km/h wind triggers penalty
    const weatherScore = (precipitation > 10 ? 30 : precipitation > 3 ? 15 : 0) +
                         (windSpeed > 50 ? 30 : windSpeed > 30 ? 10 : 0);
    const data = { weatherScore: Math.min(weatherScore, 50), precipitation, windSpeed };
    WEATHER_CACHE.set(key, { data, fetchedAt: Date.now() });
    return data;
  } catch {
    return { weatherScore: 0, precipitation: 0, windSpeed: 0 };
  }
}

// Point-in-polygon check (ray casting) for [lng, lat] point vs polygon coordinates
function pointInPolygon(point, polygon) {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Haversine distance in meters
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SEVERITY_SCORE = { low: 25, medium: 50, high: 75, critical: 100 };
const SEVERITY_LEVEL = { low: 1, medium: 2, high: 3, critical: 4 };

// Try to blend an ML risk prediction from RescueBytesAI. Fails silently if unreachable.
async function getMlRiskBlend(features) {
  const aiUrl = process.env.RESCUEBYTES_AI_URL;
  if (!aiUrl) return null;
  try {
    const res = await axios.post(`${aiUrl}/predict-risk`, features, { timeout: 4000 });
    // risk_level: 0=Low, 1=Medium, 2=High → map to 0-100 scale
    const mlScore = res.data.risk_level === 2 ? 75 : res.data.risk_level === 1 ? 40 : 10;
    return { mlScore, confidence: res.data.confidence };
  } catch {
    return null;
  }
}

/**
 * Computes a risk score 0–100 for a given coordinate.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {Object} [prefetched] - optional { activeZones, communityReports } to skip per-call DB fetch
 * @returns {Promise<{score, aqiValue, naqiBand, inDangerZone, nearbyHazards, weatherScore}>}
 */
export async function computeRiskScore(lat, lng, prefetched = null) {
  const fetchTasks = [fetchAQI(lat, lng), fetchWeatherRisk(lat, lng)];
  if (!prefetched) {
    fetchTasks.push(DangerZone.find({ isActive: true }));
    fetchTasks.push(CommunityReport.find({ approved: true }));
  }
  const results = await Promise.all(fetchTasks);
  const aqiData = results[0];
  const weatherData = results[1];
  const activezones = prefetched ? prefetched.activeZones : results[2];
  const communityReports = prefetched ? prefetched.communityReports : results[3];

  // --- AQI component (30%) ---
  const aqiScore = aqiData.naqiScore; // already 0–100 from pm25ToNaqiBand

  // --- Danger zone component (40%) ---
  let dangerZoneScore = 0;
  let inDangerZone = false;
  const hazards = [];

  for (const zone of activezones) {
    let inside = false;
    if (zone.geometry.type === "Circle") {
      const [zLng, zLat] = zone.geometry.coordinates;
      inside = distanceMeters(lat, lng, zLat, zLng) <= (zone.geometry.radius || 500);
    } else if (zone.geometry.type === "Polygon") {
      inside = pointInPolygon([lng, lat], zone.geometry.coordinates);
    }
    if (inside) {
      inDangerZone = true;
      const s = SEVERITY_SCORE[zone.severity] ?? 50;
      if (s > dangerZoneScore) dangerZoneScore = s;
      hazards.push({ type: "danger_zone", title: zone.title, severity: zone.severity, zoneType: zone.type });
    }
  }

  // --- Community reports component (20%) ---
  let communityScore = 0;
  for (const report of communityReports) {
    // Try to parse "lat,lng" format stored in location field
    const parts = report.location?.split(",").map(Number);
    if (parts?.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const dist = distanceMeters(lat, lng, parts[0], parts[1]);
      if (dist <= 500) {
        communityScore = Math.min(communityScore + 20, 40);
        hazards.push({ type: "community_report", description: report.description, reportType: report.type });
      }
    }
  }

  // --- Weather component (10%) ---
  const { weatherScore, precipitation, windSpeed } = weatherData;

  // Rule-based weighted score
  const ruleScore = Math.round(
    aqiScore * 0.30 +
    dangerZoneScore * 0.40 +
    communityScore * 0.20 +
    weatherScore * 0.10
  );

  // Find the strongest danger zone severity for ML features
  let maxSeverity = 0;
  for (const z of activezones) {
    if (inDangerZone && SEVERITY_LEVEL[z.severity] > maxSeverity) {
      maxSeverity = SEVERITY_LEVEL[z.severity];
    }
  }

  // Optional: blend with ML prediction from RescueBytesAI
  const ml = await getMlRiskBlend({
    aqi_value: aqiData.pm25 || 0,
    precipitation_mm_h: precipitation,
    wind_speed_kmh: windSpeed,
    in_danger_zone: inDangerZone ? 1 : 0,
    danger_zone_severity: maxSeverity,
    community_reports_nearby: hazards.filter((h) => h.type === "community_report").length,
    hour_of_day: new Date().getHours(),
    elevation_gain_m: 0, // unknown at point level; safeRoute supplies route-wide value
  });

  // Blend: 60% rule-based + 40% ML if available
  const score = ml
    ? Math.min(Math.round(ruleScore * 0.6 + ml.mlScore * 0.4), 100)
    : Math.min(ruleScore, 100);

  return {
    score,
    ruleScore: Math.min(ruleScore, 100),
    mlBlended: !!ml,
    mlConfidence: ml?.confidence ?? null,
    aqiValue: aqiData.pm25,
    naqiBand: aqiData.naqiBand,
    naqiColor: aqiData.naqiColor,
    inDangerZone,
    nearbyHazards: hazards,
    weatherScore,
    precipitation,
    windSpeed,
  };
}
