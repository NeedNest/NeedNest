import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// Fix Leaflet default marker icon (broken with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── FlyTo — uses useEffect so it only fires when flyTarget actually changes ──
const FlyToController = ({ flyTarget }) => {
  const map = useMap();
  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], 16, { duration: 1.2 });
    }
  }, [flyTarget, map]);
  return null;
};

// ─── Leaflet-native geolocation via map.locate() ──────────────────────────
// This triggers Leaflet's own location flow which properly prompts the browser
const LocateController = ({ active, onFound, onError, onDone }) => {
  const map = useMap();

  useEffect(() => {
    if (!active) return;

    // Leaflet's locate — setView pans the map automatically
    map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true, timeout: 15000 });

    const handleFound = (e) => {
      onFound({ lat: e.latlng.lat, lng: e.latlng.lng });
      onDone();
    };
    const handleError = (e) => {
      onError(e.message || 'Location access denied or unavailable.');
      onDone();
    };

    map.on('locationfound', handleFound);
    map.on('locationerror', handleError);

    return () => {
      map.off('locationfound', handleFound);
      map.off('locationerror', handleError);
    };
  }, [active, map, onFound, onError, onDone]);

  return null;
};

// ─── Map click handler ────────────────────────────────────────────────────
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => onLocationSelect(e.latlng),
  });
  return null;
};

// ─── Main component ───────────────────────────────────────────────────────
const LocationPicker = ({ onLocationChange }) => {
  const [position,   setPosition]   = useState(null);
  const [flyTarget,  setFlyTarget]  = useState(null);
  const [locating,   setLocating]   = useState(false); // triggers LocateController
  const [loading,    setLoading]    = useState(false);
  const [status,     setStatus]     = useState(
    'Click on the map or press "Use My Location" to auto-fill your address'
  );

  // Nominatim reverse geocode at zoom=18 for street-level precision
  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true);
    setStatus('🔄 Fetching address details...');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&zoom=18&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const addr = data.address || {};

      const city    = addr.city || addr.town || addr.municipality || addr.village || addr.county || addr.state_district || '';
      const state   = addr.state || '';
      const pincode = addr.postcode || '';
      const streetParts = [addr.house_number, addr.road || addr.pedestrian, addr.neighbourhood || addr.suburb].filter(Boolean);
      const address = streetParts.join(', ');

      onLocationChange({ city, state, address, pincode, lat, lng });
      setStatus(`📍 ${(data.display_name || '').split(',').slice(0, 4).join(', ')}`);
    } catch {
      setStatus('⚠️ Could not fetch address. Please fill in manually.');
    } finally {
      setLoading(false);
    }
  }, [onLocationChange]);

  // Map click
  const handleLocationSelect = useCallback((latlng) => {
    setPosition(latlng);
    setFlyTarget(latlng);
    reverseGeocode(latlng.lat, latlng.lng);
  }, [reverseGeocode]);

  // Geolocation found (via Leaflet map.locate)
  const handleLocateFound = useCallback((latlng) => {
    setPosition(latlng);
    setFlyTarget(latlng);
    reverseGeocode(latlng.lat, latlng.lng);
  }, [reverseGeocode]);

  const handleLocateError = useCallback((msg) => {
    setStatus(`🔒 ${msg} — try clicking on the map instead.`);
  }, []);

  const handleLocateDone = useCallback(() => setLocating(false), []);

  const handleLocateMe = () => {
    if (locating || loading) return;
    setStatus('🔄 Detecting your location...');
    setLocating(true); // activates LocateController inside the map
  };

  return (
    <div className="location-picker">
      {/* Toolbar */}
      <div className="lp-toolbar">
        <span className="lp-status" title={status}>
          {(loading || locating) ? '🔄 Detecting...' : status}
        </span>
        <button
          type="button"
          className="lp-locate-btn"
          onClick={handleLocateMe}
          disabled={loading || locating}
        >
          {locating ? '⏳ Locating...' : '📍 Use My Location'}
        </button>
      </div>

      {/* Map */}
      <div className="lp-map-wrap">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          className="lp-map"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <FlyToController flyTarget={flyTarget} />
          <LocateController
            active={locating}
            onFound={handleLocateFound}
            onError={handleLocateError}
            onDone={handleLocateDone}
          />
          {position && <Marker position={position} />}
        </MapContainer>

        {!position && (
          <div className="lp-overlay-hint">
            <span>🗺️ Click on the map to pin your pickup location</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
