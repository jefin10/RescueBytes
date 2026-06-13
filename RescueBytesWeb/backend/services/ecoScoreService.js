// India BS6-calibrated emission factors (kg CO2 per km)
const EMISSION_FACTORS = {
  car_petrol: 0.22,
  car_diesel: 0.19,
  motorcycle: 0.09,
  auto_rickshaw: 0.10, // CNG auto-rickshaw
  ev: 0,
};

// ORS waycategory bitmask values → eco-friendliness penalty (0=best, 70=worst)
// See https://giscience.github.io/openrouteservice/api-reference/extra-info/way-category
const WAYCATEGORY_PENALTY = {
  0: 30,    // No category (city street, default)
  1: 0,     // Highway (steady speed = eco-friendly)
  2: 5,     // Tollway (still highway-like)
  3: 60,    // Steps (irrelevant for driving but penalise)
  4: 40,    // Ferry
  8: 65,    // Unpaved road (rough = high fuel)
  16: 70,   // Track
  32: 20,   // Tunnel
  64: 25,   // Paved road
  128: 50,  // Ford
};

function calcElevationGain(elevationArray) {
  if (!elevationArray || elevationArray.length < 2) return 0;
  let gain = 0;
  for (let i = 1; i < elevationArray.length; i++) {
    const diff = elevationArray[i] - elevationArray[i - 1];
    if (diff > 0) gain += diff;
  }
  return gain;
}

/**
 * Computes eco score for a single ORS GeoJSON feature (one route).
 *
 * @param {Object} feature      - full ORS feature: { geometry, properties }
 * @param {string} vehicleType  - one of EMISSION_FACTORS keys
 * @returns {Object}
 */
export function computeEcoScore(feature, vehicleType = "car_petrol") {
  const properties = feature?.properties || {};
  const geometry = feature?.geometry || {};
  const summary = properties.summary || {};

  const distanceKm = (summary.distance || 0) / 1000;
  const steps = properties.segments?.[0]?.steps || [];

  // Each coord is [lng, lat, ele] when elevation: true was requested
  const coords = geometry.coordinates || [];
  const elevationArray = coords.map((c) => c[2]).filter((v) => typeof v === "number");

  // 1. Elevation gain
  const elevationGain = calcElevationGain(elevationArray);
  const elevMultiplier = 1 + (elevationGain / 1000) * 0.08;

  // 2. CO2 estimate
  const emissionFactor = EMISSION_FACTORS[vehicleType] ?? EMISSION_FACTORS.car_petrol;
  const estimatedCO2_kg = distanceKm * emissionFactor * elevMultiplier;

  // CO2 score: normalise vs petrol-car baseline of 50km journey
  const co2Baseline = 50 * EMISSION_FACTORS.car_petrol;
  const co2Score = Math.min((estimatedCO2_kg / co2Baseline) * 100, 100);

  // 3. Elevation penalty
  let elevationScore = 0;
  if (elevationGain >= 300) elevationScore = 80;
  else if (elevationGain >= 150) elevationScore = 40;
  else if (elevationGain >= 50) elevationScore = 20;

  // 4. Road type efficiency from ORS extras.waycategory.summary
  // (only present if request included extra_info: ["waycategory"])
  let roadTypeScore = 30; // neutral default
  const wcSummary = properties.extras?.waycategory?.summary || [];
  if (wcSummary.length > 0) {
    let weighted = 0;
    let totalAmount = 0;
    for (const entry of wcSummary) {
      const penalty = WAYCATEGORY_PENALTY[entry.value] ?? 30;
      weighted += penalty * (entry.amount || 0);
      totalAmount += entry.amount || 0;
    }
    if (totalAmount > 0) roadTypeScore = weighted / totalAmount;
  }

  // 5. Stop count proxy from steps (turns/instructions ≈ intersections)
  // ORS step.type values 0-13 cover various maneuvers; turn maneuvers are typically 0-3, 4-7
  const stopCount = steps.filter((s) => {
    if (typeof s.type === "number") return s.type >= 0 && s.type <= 7;
    return false;
  }).length;

  let congestionScore = 0;
  if (stopCount > 40) congestionScore = 70;
  else if (stopCount > 20) congestionScore = 40;
  else if (stopCount > 8) congestionScore = 20;

  // Weighted eco score
  const ecoScore = Math.min(
    Math.round(
      co2Score * 0.35 +
      elevationScore * 0.20 +
      roadTypeScore * 0.25 +
      congestionScore * 0.20
    ),
    100
  );

  return {
    ecoScore,
    estimatedCO2_kg: Math.round(estimatedCO2_kg * 100) / 100,
    elevationGain_m: Math.round(elevationGain),
    stopCount,
    roadTypeScore: Math.round(roadTypeScore),
    congestionScore,
  };
}
