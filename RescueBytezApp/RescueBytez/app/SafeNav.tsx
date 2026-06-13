import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Linking, Platform, Keyboard
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '@/Auth/api';
import ScreenWrapper from '@/components/ScreenWrapper';
import Navbar from '@/components/Navbar';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RouteResult {
  geometry: { coordinates: number[][] };
  distance_m: number;
  duration_s: number;
  safetyScore: number;
  ecoScore: number;
  combinedScore: number;
  estimatedCO2_kg: number;
  elevationGain_m: number;
  naqiBand: string;
  naqiColor: string;
  hazards: { type: string; title?: string; description?: string; severity?: string; zoneType?: string }[];
  poorCoverage: boolean;
}

interface GeoapifyResult {
  properties: { formatted: string; lat: number; lon: number };
}

const VEHICLE_OPTIONS = [
  { key: 'car_petrol', label: 'Car (Petrol)', icon: 'car' },
  { key: 'car_diesel', label: 'Car (Diesel)', icon: 'car-outline' },
  { key: 'motorcycle', label: 'Motorcycle', icon: 'bicycle' },
  { key: 'auto_rickshaw', label: 'Auto-Rickshaw', icon: 'car-sport' },
  { key: 'ev', label: 'EV', icon: 'flash' },
] as const;

const PRIORITY_OPTIONS = [
  { key: 'safe', label: 'Safest' },
  { key: 'balanced', label: 'Balanced' },
  { key: 'eco', label: 'Eco' },
] as const;

function scoreColor(score: number) {
  if (score < 30) return '#22c55e';
  if (score < 60) return '#f59e0b';
  return '#ef4444';
}

function naqiBadgeColor(band: string) {
  const map: Record<string, string> = {
    'Good': '#22c55e', 'Satisfactory': '#84cc16', 'Moderate': '#f59e0b',
    'Poor': '#ef4444', 'Very Poor': '#b91c1c', 'Severe': '#7f1d1d',
  };
  return map[band] || '#6b7280';
}

// ── Leaflet HTML (rendered inside WebView) ────────────────────────────────────

function buildMapHtml(userLat: number, userLng: number) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;}
  .route-label{background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:4px;padding:2px 6px;font-size:11px;font-weight:bold;}
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map',{zoomControl:true}).setView([${userLat},${userLng}],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);

  var userMarker = L.circleMarker([${userLat},${userLng}],{radius:8,color:'#3b82f6',fillColor:'#3b82f6',fillOpacity:1,weight:2}).addTo(map);
  userMarker.bindPopup('Your location').openPopup();

  var routeLayers = [];
  var dangerLayers = [];

  function clearRoutes(){
    routeLayers.forEach(function(l){map.removeLayer(l);});
    routeLayers=[];
  }

  function clearDangerZones(){
    dangerLayers.forEach(function(l){map.removeLayer(l);});
    dangerLayers=[];
  }

  function drawRoutes(routes){
    clearRoutes();
    var colors=['#22c55e','#f59e0b','#ef4444'];
    var bounds=[[${userLat},${userLng}]];
    routes.forEach(function(r,i){
      var coords=r.geometry.coordinates.map(function(c){return[c[1],c[0]];});
      var color=i===0?colors[0]:(r.combinedScore<60?colors[1]:colors[2]);
      if(r.combinedScore>=60) color=colors[2];
      else if(r.combinedScore>=30) color=colors[1];
      else color=colors[0];

      var pl=L.polyline(coords,{color:color,weight:i===0?7:4,opacity:i===0?1:0.6}).addTo(map);
      if(i===0) pl.bringToFront();
      routeLayers.push(pl);
      coords.forEach(function(c){bounds.push(c);});

      var mid=coords[Math.floor(coords.length/2)];
      var lbl=L.marker(mid,{
        icon:L.divIcon({className:'route-label',html:(i===0?'★ ':'')+'Score '+(r.combinedScore)})
      }).addTo(map);
      routeLayers.push(lbl);

      pl.on('click',function(){
        window.ReactNativeWebView.postMessage(JSON.stringify({type:'routeSelect',index:i}));
      });
    });
    if(bounds.length>1) map.fitBounds(bounds,{padding:[40,40]});
  }

  function drawDangerZones(zones){
    clearDangerZones();
    var sevColors={low:'#22c55e',medium:'#eab308',high:'#f97316',critical:'#ef4444'};
    zones.forEach(function(z){
      var c=sevColors[z.severity]||'#999';
      var layer;
      if(z.geometry.type==='Circle'){
        layer=L.circle([z.geometry.coordinates[1],z.geometry.coordinates[0]],
          {radius:z.geometry.radius||500,color:c,fillColor:c,fillOpacity:0.2,weight:2}).addTo(map);
      } else if(z.geometry.type==='Polygon'){
        var pts=z.geometry.coordinates.map(function(c){return[c[1],c[0]];});
        layer=L.polygon(pts,{color:c,fillColor:c,fillOpacity:0.2,weight:2}).addTo(map);
      }
      if(layer) layer.bindPopup('<b>'+z.title+'</b><br>'+z.type+' · '+z.severity);
      if(layer) dangerLayers.push(layer);
    });
  }

  window.addEventListener('message',function(e){
    var msg=JSON.parse(e.data);
    if(msg.type==='routes') drawRoutes(msg.routes);
    if(msg.type==='dangerZones') drawDangerZones(msg.zones);
    if(msg.type==='updateUser') {
      map.setView([msg.lat,msg.lng],13);
      userMarker.setLatLng([msg.lat,msg.lng]);
    }
  });
</script>
</body></html>`;
}

// ── Main Component ─────────────────────────────────────────────────────────────

const SafeNav: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoapifyResult[]>([]);
  const [destination, setDestination] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [vehicleType, setVehicleType] = useState<string>('car_petrol');
  const [priority, setPriority] = useState<string>('balanced');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [dangerZones, setDangerZones] = useState<any[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  // Fetch active danger zones on mount
  useEffect(() => {
    axios.get(`${API_URL}/dangerZone/active`)
      .then((r) => setDangerZones(r.data.zones || []))
      .catch(() => {});
  }, []);

  // Inject danger zones when map is ready
  useEffect(() => {
    if (mapReady && dangerZones.length > 0) {
      injectMessage({ type: 'dangerZones', zones: dangerZones });
    }
  }, [mapReady, dangerZones]);

  // Update user location on map
  useEffect(() => {
    if (mapReady && userLocation) {
      injectMessage({ type: 'updateUser', lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [mapReady, userLocation]);

  const injectMessage = (payload: object) => {
    webViewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify(payload))}}));true;`
    );
  };

  // Address autocomplete via backend proxy (avoids exposing the API key in the mobile bundle)
  const handleQueryChange = async (text: string) => {
    setQuery(text);
    if (text.length < 3) { setSuggestions([]); return; }
    try {
      const res = await axios.get(`${API_URL}/geo/autocomplete`, { params: { text } });
      setSuggestions(res.data.features || []);
    } catch { setSuggestions([]); }
  };

  const selectDestination = (item: GeoapifyResult) => {
    Keyboard.dismiss();
    setDestination({ lat: item.properties.lat, lng: item.properties.lon, label: item.properties.formatted });
    setQuery(item.properties.formatted);
    setSuggestions([]);
  };

  const computeRoutes = async () => {
    if (!userLocation || !destination) return;
    setLoading(true);
    setRoutes([]);
    setExplanation('');
    setShowSheet(false);
    try {
      const res = await axios.post(`${API_URL}/safeRoute`, {
        origin: userLocation,
        destination: { lat: destination.lat, lng: destination.lng },
        vehicleType,
        priority,
      });
      const r: RouteResult[] = res.data.routes || [];
      setRoutes(r);
      setSelectedRoute(0);
      setShowSheet(true);
      injectMessage({ type: 'routes', routes: r });

      // Fetch Gemini explanation for top route
      if (r[0]) {
        axios.post(`${API_URL}/safeRoute/explain`, r[0])
          .then((er) => setExplanation(er.data.explanation || ''))
          .catch(() => {});
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to compute route. Check if ORS_API_KEY is configured.');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (!destination) return;
    const dest = `${destination.lat},${destination.lng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const url = Platform.OS === 'ios'
      ? `maps://?saddr=${origin}&daddr=${dest}`
      : `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
    Linking.openURL(url);
  };

  const route = routes[selectedRoute];

  return (
    <ScreenWrapper bg="#f3f4f6">
      <Navbar />
      <View style={styles.container}>
        {/* Search bar */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Where to?"
            value={query}
            onChangeText={handleQueryChange}
            placeholderTextColor="#9ca3af"
          />
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} onPress={() => selectDestination(s)} style={styles.suggestionItem}>
                  <Ionicons name="location-outline" size={14} color="#6b7280" style={{ marginRight: 6 }} />
                  <Text style={styles.suggestionText} numberOfLines={1}>{s.properties.formatted}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Vehicle + Priority pickers */}
        <View style={styles.pickerRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
            {VEHICLE_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v.key}
                onPress={() => setVehicleType(v.key)}
                style={[styles.chip, vehicleType === v.key && styles.chipActive]}
              >
                <Ionicons name={v.icon as any} size={13} color={vehicleType === v.key ? '#fff' : '#374151'} />
                <Text style={[styles.chipText, vehicleType === v.key && styles.chipTextActive]}>{v.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.pickerRow}>
          {PRIORITY_OPTIONS.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPriority(p.key)}
              style={[styles.chip, priority === p.key && styles.chipActive, { flex: 1, justifyContent: 'center' }]}
            >
              <Text style={[styles.chipText, priority === p.key && styles.chipTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Go button */}
        <TouchableOpacity
          style={[styles.goBtn, (!destination || !userLocation || loading) && styles.goBtnDisabled]}
          onPress={computeRoutes}
          disabled={!destination || !userLocation || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.goBtnText}>Find Safe Route</Text>}
        </TouchableOpacity>

        {/* Map */}
        <View style={styles.mapContainer}>
          {userLocation ? (
            <WebView
              ref={webViewRef}
              source={{ html: buildMapHtml(userLocation.lat, userLocation.lng) }}
              style={styles.map}
              onLoadEnd={() => setMapReady(true)}
              onMessage={(e) => {
                try {
                  const msg = JSON.parse(e.nativeEvent.data);
                  if (msg.type === 'routeSelect') { setSelectedRoute(msg.index); setShowSheet(true); }
                } catch {}
              }}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
            />
          ) : (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator color="#3b82f6" />
              <Text style={{ marginTop: 8, color: '#6b7280' }}>Getting your location…</Text>
            </View>
          )}
        </View>

        {/* Bottom sheet — route details */}
        {showSheet && route && (
          <View style={styles.sheet}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.sheetBadge}>
                  <Text style={styles.sheetBadgeText}>
                    {selectedRoute === 0 ? '★ Recommended' : `Route ${selectedRoute + 1}`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowSheet(false)}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Distance / time */}
              <View style={styles.routeStats}>
                <Text style={styles.statText}>{(route.distance_m / 1000).toFixed(1)} km</Text>
                <Text style={styles.statSep}>·</Text>
                <Text style={styles.statText}>{Math.round(route.duration_s / 60)} min</Text>
                <Text style={styles.statSep}>·</Text>
                <Text style={styles.statText}>↑ {route.elevationGain_m}m</Text>
              </View>

              {/* Scores row */}
              <View style={styles.scoresRow}>
                <View style={[styles.scorePill, { backgroundColor: scoreColor(route.safetyScore) }]}>
                  <Text style={styles.scoreLabel}>Safety</Text>
                  <Text style={styles.scoreValue}>{route.safetyScore}</Text>
                </View>
                <View style={[styles.scorePill, { backgroundColor: scoreColor(route.ecoScore) }]}>
                  <Text style={styles.scoreLabel}>Eco</Text>
                  <Text style={styles.scoreValue}>{route.ecoScore}</Text>
                </View>
                <View style={[styles.scorePill, { backgroundColor: naqiBadgeColor(route.naqiBand) }]}>
                  <Text style={styles.scoreLabel}>Air</Text>
                  <Text style={styles.scoreValue}>{route.naqiBand}</Text>
                </View>
              </View>

              {/* CO2 */}
              <Text style={styles.co2Text}>
                ~{route.estimatedCO2_kg} kg CO₂  {vehicleType === 'ev' ? '(EV — zero direct emissions)' : ''}
              </Text>

              {/* Poor coverage warning */}
              {route.poorCoverage && (
                <View style={styles.warningBox}>
                  <Ionicons name="warning-outline" size={14} color="#92400e" />
                  <Text style={styles.warningText}>Routing data may be incomplete for some sections</Text>
                </View>
              )}

              {/* Hazards */}
              {route.hazards.length > 0 && (
                <View style={styles.hazardSection}>
                  <Text style={styles.sectionTitle}>Hazards Along Route</Text>
                  {route.hazards.map((h, i) => (
                    <View key={i} style={styles.hazardItem}>
                      <Ionicons
                        name={h.type === 'danger_zone' ? 'alert-circle' : 'people'}
                        size={14}
                        color="#ef4444"
                      />
                      <Text style={styles.hazardText}>
                        {h.type === 'danger_zone'
                          ? `${h.title} (${h.zoneType}, ${h.severity})`
                          : h.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* AI explanation */}
              {explanation ? (
                <View style={styles.aiBox}>
                  <View style={styles.aiHeader}>
                    <MaterialCommunityIcons name="robot-outline" size={15} color="#7c3aed" />
                    <Text style={styles.aiTitle}>AI Analysis</Text>
                  </View>
                  <Text style={styles.aiText}>{explanation}</Text>
                </View>
              ) : null}

              {/* Route switcher */}
              {routes.length > 1 && (
                <View style={styles.altRoutes}>
                  <Text style={styles.sectionTitle}>Alternative Routes</Text>
                  {routes.map((r, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedRoute(i)}
                      style={[styles.altRouteItem, selectedRoute === i && styles.altRouteActive]}
                    >
                      <View style={[styles.routeDot, { backgroundColor: scoreColor(r.combinedScore) }]} />
                      <Text style={styles.altRouteText}>
                        Route {i + 1} · {(r.distance_m / 1000).toFixed(1)}km · Score {r.combinedScore}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Navigate button */}
              <TouchableOpacity style={styles.navBtn} onPress={openInMaps}>
                <Ionicons name="navigate" size={16} color="#fff" />
                <Text style={styles.navBtnText}>Open in Maps</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  searchBox: { margin: 10, zIndex: 100 },
  searchInput: {
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  suggestions: {
    backgroundColor: '#fff', borderRadius: 8, marginTop: 2,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 4, overflow: 'hidden',
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  suggestionText: { flex: 1, fontSize: 13, color: '#374151' },
  pickerRow: { flexDirection: 'row', paddingHorizontal: 10, marginBottom: 4, gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db',
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  goBtn: {
    marginHorizontal: 10, marginBottom: 6, backgroundColor: '#1d4ed8',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  goBtnDisabled: { opacity: 0.5 },
  goBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '55%', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 10,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sheetBadge: { backgroundColor: '#1d4ed8', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  sheetBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  routeStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  statSep: { marginHorizontal: 8, color: '#9ca3af' },
  scoresRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  scorePill: { flex: 1, borderRadius: 8, padding: 8, alignItems: 'center' },
  scoreLabel: { color: '#fff', fontSize: 10, fontWeight: '500', opacity: 0.85 },
  scoreValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  co2Text: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef3c7', borderRadius: 6, padding: 8, marginBottom: 8 },
  warningText: { fontSize: 11, color: '#92400e', flex: 1 },
  hazardSection: { marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  hazardItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  hazardText: { fontSize: 12, color: '#6b7280', flex: 1 },
  aiBox: { backgroundColor: '#f5f3ff', borderRadius: 10, padding: 10, marginBottom: 10 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  aiTitle: { fontSize: 12, fontWeight: '600', color: '#7c3aed' },
  aiText: { fontSize: 12, color: '#4c1d95', lineHeight: 18 },
  altRoutes: { marginBottom: 10 },
  altRouteItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6 },
  altRouteActive: { backgroundColor: '#eff6ff' },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  altRouteText: { fontSize: 12, color: '#374151' },
  navBtn: {
    backgroundColor: '#059669', borderRadius: 10, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  navBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

export default SafeNav;
