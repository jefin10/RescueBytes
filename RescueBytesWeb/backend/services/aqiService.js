import axios from "axios";

// Simple in-memory cache: key = "lat_lng", value = { data, fetchedAt }
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Maps PM2.5 µg/m³ to India NAQI band
export function pm25ToNaqiBand(pm25) {
  if (pm25 <= 30) return { band: "Good", color: "green", score: 0 };
  if (pm25 <= 60) return { band: "Satisfactory", color: "yellow", score: 20 };
  if (pm25 <= 90) return { band: "Moderate", color: "orange", score: 40 };
  if (pm25 <= 120) return { band: "Poor", color: "red", score: 60 };
  if (pm25 <= 250) return { band: "Very Poor", color: "darkred", score: 80 };
  return { band: "Severe", color: "maroon", score: 100 };
}

export async function fetchAQI(lat, lng) {
  const key = `${Math.round(lat * 100) / 100}_${Math.round(lng * 100) / 100}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&hourly=european_aqi,pm2_5,pm10&forecast_days=1&timezone=auto`;
    const response = await axios.get(url, { timeout: 8000 });
    const hourly = response.data.hourly;

    // Get the index for the current hour
    const now = new Date();
    const currentHour = now.getHours();
    const pm25 = hourly.pm2_5?.[currentHour] ?? 0;
    const pm10 = hourly.pm10?.[currentHour] ?? 0;
    const euroAqi = hourly.european_aqi?.[currentHour] ?? 0;

    const naqi = pm25ToNaqiBand(pm25);
    const result = { pm25, pm10, euroAqi, naqiBand: naqi.band, naqiColor: naqi.color, naqiScore: naqi.score };

    cache.set(key, { data: result, fetchedAt: Date.now() });
    return result;
  } catch {
    // Return neutral values if API fails
    return { pm25: 0, pm10: 0, euroAqi: 0, naqiBand: "Unknown", naqiColor: "grey", naqiScore: 0 };
  }
}
