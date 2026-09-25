import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Layers, ZoomIn, Maximize2, Sparkles, CheckCircle2 } from 'lucide-react';
import { getLocationCoords } from '../data/locations';

interface MapViewProps {
  fromLocation?: string;
  toLocation?: string;
  fromCoords?: [number, number];
  toCoords?: [number, number];
  waypoints?: string[];
  routeText?: string;
  className?: string;
  height?: string;
  showControls?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  fromLocation = 'Hassan Square',
  toLocation = 'DHA Phase 6',
  fromCoords: propFromCoords,
  toCoords: propToCoords,
  waypoints = [],
  routeText,
  className = 'w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 z-0 relative bg-slate-900',
  height = 'h-[260px]',
  showControls = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'osm'>('streets');
  const [zoomLevel, setZoomLevel] = useState<number>(13);

  // Resolve coordinates
  const actualFromCoords: [number, number] = propFromCoords || getLocationCoords(fromLocation);
  const actualToCoords: [number, number] = propToCoords || getLocationCoords(toLocation);

  // Generate realistic curved road polyline points
  const generateRoadPath = (start: [number, number], end: [number, number]): [number, number][] => {
    const points: [number, number][] = [start];
    const steps = 6;

    const dLat = end[0] - start[0];
    const dLng = end[1] - start[1];

    for (let i = 1; i < steps; i++) {
      const frac = i / steps;
      // Add slight organic offset to mimic real road curves/junctions
      const curveOffsetLat = Math.sin(frac * Math.PI) * (dLng * 0.25);
      const curveOffsetLng = Math.cos(frac * Math.PI) * (dLat * 0.15);

      const lat = start[0] + dLat * frac + curveOffsetLat;
      const lng = start[1] + dLng * frac + curveOffsetLng;
      points.push([lat, lng]);
    }

    points.push(end);
    return points;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing instance safely
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (err) {
        console.warn('Map cleanup notice:', err);
      }
      mapInstanceRef.current = null;
    }

    // Reset leaflet container id to prevent 'Map container is already initialized' error
    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    let map: L.Map | null = null;
    let timer: any = null;

    try {
      if (!mapContainerRef.current) return;

      const centerLat = (actualFromCoords[0] + actualToCoords[0]) / 2;
      const centerLng = (actualFromCoords[1] + actualToCoords[1]) / 2;

      map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([centerLat, centerLng], 13);

      // Tile Layer URLs
      const tileUrls = {
        streets: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      };

      const tileLayer = L.tileLayer(tileUrls[mapType], {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Custom Pin Icons with Labels
      const originIcon = L.divIcon({
        className: 'custom-origin-pin',
        html: `
          <div style="display:flex;align-items:center;gap:4px;background:#2563eb;color:white;padding:3px 8px;border-radius:12px;font-weight:900;font-size:10px;box-shadow:0 3px 10px rgba(0,0,0,0.5);border:2px solid #93c5fd;">
            <span style="width:8px;height:8px;background:white;border-radius:50%;display:inline-block"></span>
            PICKUP
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 24]
      });

      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="display:flex;align-items:center;gap:4px;background:#1e3a8a;color:white;padding:3px 8px;border-radius:12px;font-weight:900;font-size:10px;box-shadow:0 3px 10px rgba(0,0,0,0.5);border:2px solid #60a5fa;">
            <span style="width:8px;height:8px;background:white;border-radius:50%;display:inline-block"></span>
            DROP-OFF
          </div>
        `,
        iconSize: [75, 24],
        iconAnchor: [37, 24]
      });

      // Add Markers
      L.marker(actualFromCoords, { icon: originIcon }).addTo(map).bindPopup(`<b>Pickup Point:</b><br/>${fromLocation}`);
      L.marker(actualToCoords, { icon: destIcon }).addTo(map).bindPopup(`<b>Destination Point:</b><br/>${toLocation}`);

      // Render intermediate waypoints if provided
      waypoints.forEach((wpName) => {
        const wpCoords = getLocationCoords(wpName);
        const wpIcon = L.divIcon({
          className: 'custom-wp-pin',
          html: `
            <div style="background:#0284c7;color:white;padding:2px 6px;border-radius:8px;font-weight:800;font-size:9px;border:1.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);">
              📍 ${wpName}
            </div>
          `,
          iconSize: [50, 20],
          iconAnchor: [25, 20]
        });
        if (map) {
          L.marker(wpCoords, { icon: wpIcon }).addTo(map).bindPopup(`<b>Hotspot Stopover:</b> ${wpName}`);
        }
      });

      // Draw Route Path
      const roadPath = generateRoadPath(actualFromCoords, actualToCoords);
      
      // Outer glow polyline
      L.polyline(roadPath, {
        color: '#0369a1',
        weight: 7,
        opacity: 0.4
      }).addTo(map);

      // Inner vibrant polyline
      const routeLine = L.polyline(roadPath, {
        color: '#38bdf8',
        weight: 4,
        opacity: 0.95,
        dashArray: mapType === 'satellite' ? '8, 6' : undefined
      }).addTo(map);

      // Fit map bounds cleanly with comfortable street padding
      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

      map.on('zoomend', () => {
        if (map) {
          setZoomLevel(map.getZoom());
        }
      });

      mapInstanceRef.current = map;

      timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    } catch (e) {
      console.warn('Leaflet map error:', e);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          // safe ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, [actualFromCoords[0], actualFromCoords[1], actualToCoords[0], actualToCoords[1], mapType]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const roadPath = generateRoadPath(actualFromCoords, actualToCoords);
      const bounds = L.latLngBounds(roadPath);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className={`w-full ${height} rounded-2xl z-0`} />

      {/* Top Map Layer Selector Toggle (Streets vs Satellite) */}
      {showControls && (
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg text-white">
          <button
            type="button"
            onClick={() => setMapType('streets')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 ${
              mapType === 'streets'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🗺️ Streets
          </button>

          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 ${
              mapType === 'satellite'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🛰️ Satellite
          </button>
        </div>
      )}

      {/* Top Left Navigation Zoom & Fit Controls */}
      {showControls && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
          <div className="bg-slate-900/85 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-1 flex items-center gap-1 text-white">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-7 h-7 rounded-lg hover:bg-white/20 text-xs font-black flex items-center justify-center transition"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-7 h-7 rounded-lg hover:bg-white/20 text-xs font-black flex items-center justify-center transition"
              title="Zoom Out"
            >
              -
            </button>
            <div className="w-px h-4 bg-white/20 my-auto mx-0.5" />
            <button
              type="button"
              onClick={handleRecenter}
              className="px-2 py-1 rounded-lg hover:bg-white/20 text-[10px] font-bold flex items-center gap-1 transition"
              title="Fit Full Route"
            >
              <Maximize2 className="w-3 h-3 text-sky-400" />
              <span>Fit Route</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Route Information Banner */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 shadow-xl text-white flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-300" /> Live Interactive GPS Route
          </p>
          <p className="text-xs font-extrabold text-white truncate mt-0.5">
            {fromLocation} <span className="text-sky-300">➔</span> {toLocation}
          </p>
        </div>

        <div className="shrink-0 text-right bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
          <span className="text-[10px] font-black text-blue-300 block">
            Street-Level Map
          </span>
          <span className="text-[9px] text-slate-300 font-mono">
            {actualFromCoords[0].toFixed(3)}, {actualFromCoords[1].toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
};
