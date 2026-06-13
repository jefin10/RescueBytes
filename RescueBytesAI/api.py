"""
RescueBytesAI FastAPI service — port 8001
Endpoints:
  POST /predict-risk        → route safety risk level (ML)
  POST /classify-report     → community report type classification (NLP)
  GET  /health              → liveness check
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="RescueBytesAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

# Load models at startup
_risk_bundle = None
_report_pipeline = None

def _load_models():
    global _risk_bundle, _report_pipeline
    risk_path = os.path.join(MODELS_DIR, "risk_model.pkl")
    report_path = os.path.join(MODELS_DIR, "report_classifier.pkl")
    if os.path.exists(risk_path):
        _risk_bundle = joblib.load(risk_path)
    if os.path.exists(report_path):
        _report_pipeline = joblib.load(report_path)

_load_models()

RISK_LABELS = {0: "Low", 1: "Medium", 2: "High"}

# ── Request/Response Models ───────────────────────────────────────────────────

class RiskInput(BaseModel):
    aqi_value: float
    precipitation_mm_h: float
    wind_speed_kmh: float
    in_danger_zone: int          # 0 or 1
    danger_zone_severity: int    # 0=none … 4=critical
    community_reports_nearby: int
    hour_of_day: int
    elevation_gain_m: float

class ReportInput(BaseModel):
    description: str

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "risk_model_loaded": _risk_bundle is not None,
        "report_model_loaded": _report_pipeline is not None,
    }

@app.post("/predict-risk")
def predict_risk(data: RiskInput):
    if _risk_bundle is None:
        raise HTTPException(status_code=503, detail="Risk model not loaded. Run train.py first.")

    model = _risk_bundle["model"]
    features = _risk_bundle["features"]
    importances = _risk_bundle["feature_importances"]

    X = np.array([[
        data.aqi_value,
        data.precipitation_mm_h,
        data.wind_speed_kmh,
        data.in_danger_zone,
        data.danger_zone_severity,
        data.community_reports_nearby,
        data.hour_of_day,
        data.elevation_gain_m,
    ]])

    proba = model.predict_proba(X)[0]
    predicted_class = int(np.argmax(proba))
    confidence = round(float(proba[predicted_class]), 3)

    return {
        "risk_level": predicted_class,
        "risk_label": RISK_LABELS[predicted_class],
        "confidence": confidence,
        "probabilities": {RISK_LABELS[i]: round(float(p), 3) for i, p in enumerate(proba)},
        "feature_importances": {k: round(v, 3) for k, v in importances.items()},
    }

@app.post("/classify-report")
def classify_report(data: ReportInput):
    if _report_pipeline is None:
        raise HTTPException(status_code=503, detail="Report model not loaded. Run train.py first.")

    text = data.description.strip()
    if not text:
        raise HTTPException(status_code=400, detail="description cannot be empty")

    proba = _report_pipeline.predict_proba([text])[0]
    classes = _report_pipeline.classes_
    top_idx = int(np.argmax(proba))
    confidence = round(float(proba[top_idx]), 3)

    alternatives = sorted(
        [{"type": c, "probability": round(float(p), 3)} for c, p in zip(classes, proba) if c != classes[top_idx]],
        key=lambda x: -x["probability"],
    )[:2]

    return {
        "predicted_type": classes[top_idx],
        "confidence": confidence,
        "alternatives": alternatives,
    }
