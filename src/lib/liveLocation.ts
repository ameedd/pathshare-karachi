/**
 * Real-time GPS Beacon & Hotspot Proximity Helper
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ProximityResult {
  distanceMeters: number;
  isWithinHotspot: boolean; // within 250 meters
  bearingDegrees: number;
  estimatedWalkingMinutes: number;
}

/**
 * Calculates Great-Circle distance between two coordinates using Haversine formula
 */
export function calculateDistanceMeters(coord1: LatLng, coord2: LatLng): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calculates bearing from start to destination
 */
export function calculateBearing(start: LatLng, dest: LatLng): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const destLat = (dest.lat * Math.PI) / 180;
  const destLng = (dest.lng * Math.PI) / 180;

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

/**
 * Checks proximity to designated safe hotspot
 */
export function checkHotspotProximity(userPos: LatLng, hotspotPos: LatLng): ProximityResult {
  const distanceMeters = calculateDistanceMeters(userPos, hotspotPos);
  const bearingDegrees = calculateBearing(userPos, hotspotPos);
  const isWithinHotspot = distanceMeters <= 250;
  // Avg walking speed ~ 5 km/h = 83 m/min
  const estimatedWalkingMinutes = Math.max(1, Math.ceil(distanceMeters / 83));

  return {
    distanceMeters,
    isWithinHotspot,
    bearingDegrees,
    estimatedWalkingMinutes
  };
}

/**
 * Request real-time GPS coordinate from browser navigator
 */
export function getCurrentGpsPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    );
  });
}
