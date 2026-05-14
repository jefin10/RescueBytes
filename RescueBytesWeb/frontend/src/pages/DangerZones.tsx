import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Polygon, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import Navbar from "../components/Navbar";
import api_url from "../api.tsx";

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const SEVERITY_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

interface DangerZone {
  _id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  geometry: { type: string; coordinates: number[] | number[][]; radius?: number };
  isActive: boolean;
  createdAt: string;
}

interface FormState {
  title: string;
  description: string;
  type: string;
  severity: string;
  radius: number;
  expiresAt: string;
}

const DEFAULT_FORM: FormState = {
  title: "",
  description: "",
  type: "flood",
  severity: "medium",
  radius: 500,
  expiresAt: "",
};

// Map click handler component
function MapClickHandler({
  drawMode,
  onCirclePlace,
  onPolygonPoint,
}: {
  drawMode: "circle" | "polygon" | null;
  onCirclePlace: (lat: number, lng: number) => void;
  onPolygonPoint: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (drawMode === "circle") onCirclePlace(e.latlng.lat, e.latlng.lng);
      if (drawMode === "polygon") onPolygonPoint(e.latlng.lat, e.latlng.lng);
    },
    dblclick(e) {
      // Prevent map zoom on double-click while drawing
      if (drawMode === "polygon") e.originalEvent.stopPropagation();
    },
  });
  return null;
}

const DangerZones: React.FC = () => {
  const [zones, setZones] = useState<DangerZone[]>([]);
  const [drawMode, setDrawMode] = useState<"circle" | "polygon" | null>(null);
  const [pendingCenter, setPendingCenter] = useState<[number, number] | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Default center: Kottayam, Kerala
  const mapCenter: [number, number] = [9.7453, 76.6442];

  const fetchZones = async () => {
    try {
      const res = await axios.get(`${api_url}/dangerZone/active`);
      setZones(res.data.zones || []);
    } catch {
      setStatusMsg({ text: "Failed to load danger zones", ok: false });
    }
  };

  useEffect(() => { fetchZones(); }, []);

  const handleCirclePlace = (lat: number, lng: number) => {
    setPendingCenter([lat, lng]);
    setDrawMode(null);
    setShowModal(true);
  };

  const handlePolygonPoint = (lat: number, lng: number) => {
    setPolygonPoints((pts) => [...pts, [lat, lng]]);
  };

  const finishPolygon = () => {
    if (polygonPoints.length < 3) {
      setStatusMsg({ text: "Need at least 3 points for a polygon", ok: false });
      return;
    }
    setDrawMode(null);
    setShowModal(true);
  };

  const cancelDraw = () => {
    setDrawMode(null);
    setPendingCenter(null);
    setPolygonPoints([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    let geometry: DangerZone["geometry"];
    if (pendingCenter) {
      geometry = {
        type: "Circle",
        coordinates: [pendingCenter[1], pendingCenter[0]], // [lng, lat]
        radius: form.radius,
      };
    } else {
      // Polygon: close the ring
      const ring = [...polygonPoints, polygonPoints[0]].map(([lat, lng]) => [lng, lat]);
      geometry = { type: "Polygon", coordinates: ring };
    }

    setLoading(true);
    try {
      await axios.post(`${api_url}/dangerZone/add`, {
        title: form.title,
        description: form.description,
        type: form.type,
        severity: form.severity,
        geometry,
        expiresAt: form.expiresAt || null,
      });
      setStatusMsg({ text: "Danger zone created successfully", ok: true });
      setShowModal(false);
      setPendingCenter(null);
      setPolygonPoints([]);
      setForm(DEFAULT_FORM);
      fetchZones();
    } catch {
      setStatusMsg({ text: "Failed to create danger zone", ok: false });
    } finally {
      setLoading(false);
    }
  };

  const deactivateZone = async (id: string) => {
    if (!confirm("Deactivate this danger zone?")) return;
    try {
      await axios.delete(`${api_url}/dangerZone/${id}`);
      setStatusMsg({ text: "Zone deactivated", ok: true });
      fetchZones();
    } catch {
      setStatusMsg({ text: "Failed to deactivate", ok: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        {/* Left panel — zone list */}
        <div className="w-full lg:w-80 bg-white shadow-md overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">Danger Zones</h2>
            <p className="text-sm text-gray-500 mt-1">{zones.length} active zone{zones.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Draw controls */}
          <div className="p-4 border-b space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Add Zone</p>
            <div className="flex gap-2">
              <button
                onClick={() => { setDrawMode("circle"); setPolygonPoints([]); setPendingCenter(null); }}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium border transition ${
                  drawMode === "circle" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Circle
              </button>
              <button
                onClick={() => { setDrawMode("polygon"); setPendingCenter(null); setPolygonPoints([]); }}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium border transition ${
                  drawMode === "polygon" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Polygon
              </button>
            </div>

            {drawMode === "circle" && (
              <p className="text-xs text-blue-600">Click on the map to place the circle center</p>
            )}
            {drawMode === "polygon" && (
              <div className="space-y-1">
                <p className="text-xs text-blue-600">
                  Click to add points ({polygonPoints.length} so far). Need ≥ 3.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={finishPolygon}
                    disabled={polygonPoints.length < 3}
                    className="flex-1 py-1 px-2 text-xs bg-green-600 text-white rounded disabled:opacity-50"
                  >
                    Finish
                  </button>
                  <button onClick={cancelDraw} className="flex-1 py-1 px-2 text-xs bg-gray-200 rounded">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Zone list */}
          <div className="divide-y">
            {zones.length === 0 && (
              <p className="p-4 text-sm text-gray-400">No active zones</p>
            )}
            {zones.map((zone) => (
              <div key={zone._id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{zone.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{zone.type} · {zone.severity}</p>
                    {zone.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{zone.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: SEVERITY_COLORS[zone.severity] || "#999" }}
                    />
                    <button
                      onClick={() => deactivateZone(zone._id)}
                      className="text-xs text-red-500 hover:text-red-700"
                      title="Deactivate"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          {statusMsg && (
            <div
              className={`absolute top-2 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded shadow text-sm font-medium ${
                statusMsg.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
              onClick={() => setStatusMsg(null)}
            >
              {statusMsg.text}
            </div>
          )}

          <MapContainer
            center={mapCenter}
            zoom={11}
            className="w-full h-full"
            style={{ cursor: drawMode ? "crosshair" : "default" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
              drawMode={drawMode}
              onCirclePlace={handleCirclePlace}
              onPolygonPoint={handlePolygonPoint}
            />

            {/* Existing zones */}
            {zones.map((zone) => {
              const color = SEVERITY_COLORS[zone.severity] || "#999";
              if (zone.geometry.type === "Circle") {
                const [lng, lat] = zone.geometry.coordinates as number[];
                return (
                  <Circle
                    key={zone._id}
                    center={[lat, lng]}
                    radius={zone.geometry.radius || 500}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }}
                  >
                    <Popup>
                      <strong>{zone.title}</strong><br />
                      {zone.type} · {zone.severity}<br />
                      {zone.description}
                    </Popup>
                  </Circle>
                );
              } else if (zone.geometry.type === "Polygon") {
                const ring = (zone.geometry.coordinates as number[][]).map(([lng, lat]) => [lat, lng] as [number, number]);
                return (
                  <Polygon
                    key={zone._id}
                    positions={ring}
                    pathOptions={{ color, fillColor: color, fillOpacity: 0.25, weight: 2 }}
                  >
                    <Popup>
                      <strong>{zone.title}</strong><br />
                      {zone.type} · {zone.severity}<br />
                      {zone.description}
                    </Popup>
                  </Polygon>
                );
              }
              return null;
            })}

            {/* In-progress polygon preview */}
            {polygonPoints.length >= 2 && (
              <Polygon
                positions={polygonPoints}
                pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 2, dashArray: "6 4" }}
              />
            )}
            {polygonPoints.map((pt, i) => (
              <Marker key={i} position={pt} />
            ))}

            {/* Pending circle center */}
            {pendingCenter && (
              <Marker position={pendingCenter} />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Create zone modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold mb-4">
              New {pendingCenter ? "Circle" : "Polygon"} Danger Zone
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Periyar Flood Zone"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Additional details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    {["flood", "fire", "chemical", "landslide", "other"].map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  >
                    {["low", "medium", "high", "critical"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {pendingCenter && (
                <div>
                  <label className="block text-sm font-medium mb-1">Radius (meters)</label>
                  <input
                    type="number"
                    min={100}
                    max={50000}
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={form.radius}
                    onChange={(e) => setForm({ ...form, radius: Number(e.target.value) })}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Expires At (optional)</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Create Zone"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); cancelDraw(); }}
                  className="flex-1 py-2 border rounded font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangerZones;
