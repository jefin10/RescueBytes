"""
Generates synthetic training datasets for:
1. Route Risk Classifier  → risk_dataset.csv
2. Community Report Classifier → report_dataset.csv
"""
import random
import csv
import os

random.seed(42)

# ── 1. Route Risk Dataset ─────────────────────────────────────────────────────

def risk_label_from_features(aqi, rain, wind, in_zone, severity, reports, hour, elev):
    score = 0
    # AQI (30%)
    if aqi > 120: score += 30
    elif aqi > 90: score += 20
    elif aqi > 60: score += 12
    elif aqi > 30: score += 6
    # Danger zone (40%)
    zone_pts = [0, 10, 25, 35, 40][min(severity, 4)]
    score += zone_pts * int(in_zone)
    # Community reports (20%)
    score += min(reports * 8, 20)
    # Weather (10%)
    if rain > 10: score += 8
    elif rain > 3: score += 4
    if wind > 50: score += 6
    elif wind > 30: score += 3
    # Night penalty
    if hour < 5 or hour > 21: score += 5
    # Elevation
    if elev > 300: score += 4
    elif elev > 150: score += 2

    if score >= 50: return 2  # High
    if score >= 22: return 1  # Medium
    return 0                  # Low

RISK_COLS = ["aqi_value","precipitation_mm_h","wind_speed_kmh","in_danger_zone",
             "danger_zone_severity","community_reports_nearby","hour_of_day",
             "elevation_gain_m","risk_level"]

rows = []
for _ in range(5000):
    aqi     = random.uniform(0, 400)
    rain    = random.uniform(0, 30)
    wind    = random.uniform(0, 80)
    in_zone = random.choice([0, 0, 0, 1])  # 25% chance
    sev     = random.randint(0, 4) if in_zone else 0
    reps    = random.randint(0, 5)
    hour    = random.randint(0, 23)
    elev    = random.uniform(0, 500)
    label   = risk_label_from_features(aqi, rain, wind, in_zone, sev, reps, hour, elev)
    # Add noise (flip ~5% of labels)
    if random.random() < 0.05:
        label = random.choice([l for l in [0, 1, 2] if l != label])
    rows.append([round(aqi,1), round(rain,2), round(wind,1), in_zone,
                 sev, reps, hour, round(elev,1), label])

out_path = os.path.join(os.path.dirname(__file__), "risk_dataset.csv")
with open(out_path, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(RISK_COLS)
    writer.writerows(rows)

print(f"Risk dataset: {len(rows)} rows → {out_path}")

# ── 2. Community Report Text Dataset ─────────────────────────────────────────

TEMPLATES = {
    "flood": [
        "road is completely submerged near {place}",
        "water logging on {place} highway",
        "bridge at {place} is underwater",
        "flood water entering houses at {place}",
        "river overflow near {place}, road blocked",
        "vehicles stranded due to flooding at {place}",
        "{place} area roads under knee-deep water",
        "underpass flooded at {place}",
    ],
    "fire": [
        "building on fire at {place}",
        "forest fire spreading near {place}",
        "gas leak and fire at {place}",
        "shop caught fire near {place} market",
        "electrical fire at {place} junction",
        "wildfire near {place} hills",
        "smoke visible from burning structure at {place}",
    ],
    "landslide": [
        "mud slide blocked {place} road",
        "hill collapsed near {place}",
        "rockfall on {place} ghat road",
        "landslide debris on {place} national highway",
        "road cut off due to landslide at {place}",
        "boulders fell on road near {place}",
    ],
    "medical": [
        "road accident at {place}, injured person needs ambulance",
        "person collapsed near {place} bus stop",
        "multiple casualties in accident on {place} road",
        "ambulance needed urgently at {place}",
        "snake bite victim at {place}",
        "pedestrian hit by vehicle near {place}",
    ],
    "power_outage": [
        "no electricity in {place} area since morning",
        "transformer tripped at {place}",
        "power lines down near {place}",
        "street lights not working in {place}",
        "area blackout at {place} due to heavy rain",
        "high tension wire fallen on {place} road",
    ],
    "other": [
        "road pothole at {place} causing accidents",
        "large tree fallen blocking {place} road",
        "cattle on {place} highway, traffic slow",
        "broken water pipe flooding road at {place}",
        "debris from construction blocking {place}",
        "traffic signal not working at {place} junction",
    ],
}

PLACES = ["Kottayam", "Ernakulam", "Thrissur", "Thiruvananthapuram", "Kozhikode",
          "NH-183", "NH-66", "Munnar Ghat", "Wayanad", "Pathanamthitta",
          "Alappuzha", "Idukki", "Palakkad", "Malappuram", "Kannur"]

report_rows = []
for label, templates in TEMPLATES.items():
    for _ in range(500):
        tmpl = random.choice(templates)
        place = random.choice(PLACES)
        text = tmpl.format(place=place)
        # Minor variations
        if random.random() < 0.3:
            text = text.capitalize() + "."
        report_rows.append([text, label])

random.shuffle(report_rows)

report_path = os.path.join(os.path.dirname(__file__), "report_dataset.csv")
with open(report_path, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["description", "type"])
    writer.writerows(report_rows)

print(f"Report dataset: {len(report_rows)} rows → {report_path}")
