/**
 * OpenStreetMap Nominatim Geocoding Client for Dynamic Karachi & Pakistan Addresses
 */

export interface GeocodedLocation {
  placeId: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  type?: string;
}

export async function searchKarachiLocations(query: string): Promise<GeocodedLocation[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const trimmed = query.trim();
    // Prioritize Karachi bounding box
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed.toLowerCase().includes('karachi') ? trimmed : `${trimmed}, Karachi, Pakistan`
    )}&addressdetails=1&limit=6&countrycodes=pk`;

    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'PathShareCarpoolApp/1.0 (support@pathshare.pk)'
      }
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
      placeId: String(item.place_id),
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type
    }));
  } catch (err) {
    console.warn('Nominatim location search failed, falling back to local dataset:', err);
    return [];
  }
}
