"""
Trains both ML models and saves them to models/.
Run once: python train.py
"""
import os
import sys
import subprocess

# Auto-generate datasets if missing
data_dir = os.path.join(os.path.dirname(__file__), "data")
risk_csv = os.path.join(data_dir, "risk_dataset.csv")
report_csv = os.path.join(data_dir, "report_dataset.csv")

if not os.path.exists(risk_csv) or not os.path.exists(report_csv):
    print("Generating datasets...")
    subprocess.run([sys.executable, os.path.join(data_dir, "generate_dataset.py")], check=True)

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

models_dir = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(models_dir, exist_ok=True)

# ── Model 1: Route Risk Classifier ───────────────────────────────────────────
print("\n=== Training Route Risk Classifier ===")
df = pd.read_csv(risk_csv)

FEATURES = ["aqi_value","precipitation_mm_h","wind_speed_kmh","in_danger_zone",
            "danger_zone_severity","community_reports_nearby","hour_of_day","elevation_gain_m"]
X = df[FEATURES].values
y = df["risk_level"].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=12,
    min_samples_split=4,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1,
)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)

acc = accuracy_score(y_test, y_pred)
print(f"Accuracy: {acc:.3f}")
print(classification_report(y_test, y_pred, target_names=["Low", "Medium", "High"]))

feature_importances = dict(zip(FEATURES, rf.feature_importances_.tolist()))
print("Feature importances:", {k: round(v, 3) for k, v in sorted(feature_importances.items(), key=lambda x: -x[1])})

risk_model_path = os.path.join(models_dir, "risk_model.pkl")
joblib.dump({"model": rf, "features": FEATURES, "feature_importances": feature_importances}, risk_model_path)
print(f"Saved → {risk_model_path}")

# ── Model 2: Community Report Classifier ─────────────────────────────────────
print("\n=== Training Community Report Classifier ===")
df2 = pd.read_csv(report_csv)

X2 = df2["description"].values
y2 = df2["type"].values

X2_train, X2_test, y2_train, y2_test = train_test_split(X2, y2, test_size=0.2, random_state=42, stratify=y2)

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)),
    ("clf", MultinomialNB(alpha=0.3)),
])
pipeline.fit(X2_train, y2_train)
y2_pred = pipeline.predict(X2_test)

acc2 = accuracy_score(y2_test, y2_pred)
print(f"Accuracy: {acc2:.3f}")
print(classification_report(y2_test, y2_pred))

report_model_path = os.path.join(models_dir, "report_classifier.pkl")
joblib.dump(pipeline, report_model_path)
print(f"Saved → {report_model_path}")

print("\n✓ Training complete. Start the API with: uvicorn api:app --port 8001 --reload")
