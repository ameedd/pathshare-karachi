import React, { useState, useEffect } from 'react';
import { Circle, MapPin, Send, Info, Car, Bike, Plus, Check, Bookmark, CheckCircle2, ShieldCheck, Compass, Luggage, Clock, Zap, Calendar, Navigation, Route as RouteIcon, Edit3 } from 'lucide-react';
import { Ride, VehicleType } from '../types';
import { MapView } from '../components/MapView';
import { getRouteDetails, getRecommendedHotspots, RecommendedHotspotOption } from '../lib/routeEngine';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { getLocationCoords } from '../data/locations';

interface PostRideScreenProps {
  onPublishRide: (newRide: Partial<Ride>) => void;
  onToast: (msg: string) => void;
}

export const PostRideScreen: React.FC<PostRideScreenProps> = ({
  onPublishRide,
  onToast,
}) => {
  const [fromLocation, setFromLocation] = useState('Clifton Block 5, Karachi');
  const [toLocation, setToLocation] = useState('DHA Phase 6, Karachi');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [serviceCategory, setServiceCategory] = useState<'passenger' | 'parcel'>('passenger');
  const [parcelDesc, setParcelDesc] = useState('Documents & Laptop bag (Max 5kg)');

  // Intercity & Hotspots
  const [isIntercity, setIsIntercity] = useState(false);
  const [luggageAllowance, setLuggageAllowance] = useState('🧳 1 Handbag / Laptop bag per seat');
  
  // Dual Hotspot Mode Selection: 'shortest' | 'second_shortest' | 'manual'
  const [hotspotSelectionMode, setHotspotSelectionMode] = useState<'shortest' | 'second_shortest' | 'manual'>('shortest');
  const [manualHotspotText, setManualHotspotText] = useState('');
  
  // Bike Helmet Flag
  const [spareHelmetProvided, setSpareHelmetProvided] = useState(true);

  // Accepted Payment Methods
  const [acceptedPayments, setAcceptedPayments] = useState<string[]>(['Cash', 'JazzCash', 'EasyPaisa']);

  // Vehicle details & Plate Number
  const [model, setModel] = useState('Honda City');
  const [year, setYear] = useState('2021');
  const [color, setColor] = useState('White');
  const [plateNumber, setPlateNumber] = useState('KHI-7890');
  const [acAvailable, setAcAvailable] = useState(true);
  const [heaterAvailable, setHeaterAvailable] = useState(false);
  
  // Auto-Save Vehicle Specs
  const [saveVehicleProfile, setSaveVehicleProfile] = useState(true);
  const [hasLoadedSavedVehicle, setHasLoadedSavedVehicle] = useState(false);

  // Real-Time Departure Timing & Seats Mode
  const [departureMode, setDepartureMode] = useState<'now' | '5min' | '15min' | '30min' | 'scheduled'>('now');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('⚡ Leaving Now');
  const [seats, setSeats] = useState(2);
  const [ladiesOnly, setLadiesOnly] = useState(false);

  // Dynamic Route & Hotspot Calculation
  const hotspotOptions = getRecommendedHotspots(fromLocation, toLocation);

  // Effective selected pickup hotspot
  const effectiveHotspot = hotspotSelectionMode === 'shortest'
    ? hotspotOptions.shortest.hotspotName
    : hotspotSelectionMode === 'second_shortest'
    ? hotspotOptions.secondShortest.hotspotName
    : manualHotspotText || hotspotOptions.shortest.hotspotName;

  // Load saved vehicle profile on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pathshare_saved_vehicle');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.model) setModel(parsed.model);
        if (parsed.year) setYear(parsed.year);
        if (parsed.color) setColor(parsed.color);
        if (parsed.plateNumber) setPlateNumber(parsed.plateNumber);
        if (parsed.vehicleType) setVehicleType(parsed.vehicleType);
        if (parsed.acAvailable !== undefined) setAcAvailable(parsed.acAvailable);
        if (parsed.heaterAvailable !== undefined) setHeaterAvailable(parsed.heaterAvailable);
        setHasLoadedSavedVehicle(true);
      }
    } catch (err) {
      console.warn('Could not read saved vehicle specs:', err);
    }
  }, []);

  const handleManualSaveVehicle = () => {
    try {
      const specs = {
        model,
        year,
        color,
        plateNumber,
        vehicleType,
        acAvailable,
        heaterAvailable
      };
      localStorage.setItem('pathshare_saved_vehicle', JSON.stringify(specs));
      setHasLoadedSavedVehicle(true);
      onToast(`Saved vehicle specs (${model} - ${plateNumber})! Auto-fills next time.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamic Base Fare calculation based on route distance
  const selectedRouteOption = hotspotSelectionMode === 'second_shortest' 
    ? hotspotOptions.secondShortest 
    : hotspotOptions.shortest;
  
  const distanceKm = selectedRouteOption.distanceKm || 14;

  let basePrice = 350;
  if (vehicleType === 'car') {
    basePrice = Math.round((100 + distanceKm * 25) / 10) * 10; // 100 base + 25/km for car
  } else if (vehicleType === 'bike') {
    if (serviceCategory === 'parcel') {
      basePrice = Math.round((40 + distanceKm * 8) / 10) * 10; // 40 base + 8/km for express parcel
    } else {
      basePrice = Math.round((50 + distanceKm * 12) / 10) * 10; // 50 base + 12/km for pillion rider
    }
  }

  const [premium, setPremium] = useState(0);
  const totalPrice = Math.max(basePrice + premium, 30);
  
  // Real-time Per KM calculation in Rs
  const perKmRate = distanceKm > 0 ? (totalPrice / distanceKm).toFixed(1) : '0';

  // Preferences
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(['No smoking', 'Quiet']);

  const togglePreference = (pref: string) => {
    setSelectedPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleVehicleTypeChange = (type: VehicleType) => {
    setVehicleType(type);
    if (type === 'bike') {
      if (model === 'Honda City') setModel('Honda CG 125');
      setSeats(1); // Strictly 1 seat / slot for motorbike
    } else {
      if (model === 'Honda CG 125') setModel('Honda City');
      setSeats(2);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation.trim() || !toLocation.trim()) {
      onToast('Please enter both origin and destination.');
      return;
    }

    if (!plateNumber.trim()) {
      onToast('Please enter vehicle registration plate number (e.g. KHI-7890).');
      return;
    }

    // Auto-save vehicle specs if checkbox enabled
    if (saveVehicleProfile) {
      const specs = {
        model,
        year,
        color,
        plateNumber,
        vehicleType,
        acAvailable,
        heaterAvailable
      };
      localStorage.setItem('pathshare_saved_vehicle', JSON.stringify(specs));
    }

    const routeInfo = getRouteDetails(toLocation);

    const newRide: Partial<Ride> = {
      type: vehicleType,
      serviceCategory: vehicleType === 'bike' ? serviceCategory : 'passenger',
      parcelDescription: vehicleType === 'bike' && serviceCategory === 'parcel' ? parcelDesc : undefined,
      driver: 'You (Driver)',
      gender: 'male',
      rating: 5.0,
      reviews: 1,
      verified: true,
      from: fromLocation,
      to: toLocation,
      time: time,
      seats: vehicleType === 'bike' ? 1 : seats, // Motorbike strictly 1 seat or 1 parcel slot
      basePrice: basePrice,
      price: totalPrice,
      km: distanceKm,
      vehicle: model,
      plateNumber: plateNumber,
      modelYear: year,
      color: color,
      ac: vehicleType === 'car' ? acAvailable : false,
      heater: vehicleType === 'car' ? heaterAvailable : false,
      prefs: selectedPrefs,
      ladiesOnly: ladiesOnly,
      cnicVerified: true,
      licenseVerified: true,
      avatar: 'YOU',
      route: `${fromLocation} → ${selectedRouteOption.corridorDescription} → ${toLocation}`,
      via: routeInfo.waypoints,
      intercity: isIntercity,
      luggageAllowance: isIntercity ? luggageAllowance : undefined,
      pickupHotspot: effectiveHotspot,
      spareHelmetProvided: vehicleType === 'bike' ? spareHelmetProvided : undefined,
      paymentMethodsAccepted: acceptedPayments,
      startPin: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryPin: Math.floor(1000 + Math.random() * 9000).toString(),
      coordinates: {
        from: getLocationCoords(fromLocation),
        to: getLocationCoords(toLocation)
      }
    };

    onPublishRide(newRide);
  };

  const availablePrefs = vehicleType === 'car'
    ? ['No smoking', 'Quiet ride', 'Music OK', 'AC Always On']
    : ['Helmet provided', 'Extra helmet', 'Quiet ride'];

  return (
    <div className="pb-24 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 min-h-screen text-slate-100">
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-blue-900/40 p-4 sticky top-0 z-20 shadow-2xl">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <h2 className="text-lg font-bold text-white">Post your ride</h2>
            <p className="text-xs text-blue-300 font-medium">Leaving office? Share your vacant seats or motorbike.</p>
          </div>

          {/* Intercity Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsIntercity(!isIntercity)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              isIntercity
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            {isIntercity ? '🛣️ Intercity Ride' : '🏙️ City Commute'}
          </button>
        </div>
      </header>

      <form onSubmit={handlePublish} className="p-4 space-y-5 max-w-md mx-auto">
        {/* Soft-Launch Target Corridors Quick-Tap */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-blue-900/60 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sky-300 font-bold flex items-center gap-1">
              🚀 Quick Soft-Launch Corridors
            </span>
            <span className="text-[10px] text-slate-400">1-Tap Fill</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            {[
              { label: '🎓 IBA / NED Uni', from: 'Gulshan-e-Iqbal, Karachi', to: 'University Road (NED/KU), Karachi' },
              { label: '💼 Clifton ⇄ Chundrigar', from: 'Clifton, Karachi', to: 'I.I. Chundrigar Road, Karachi' },
              { label: '🏢 Shahrah-e-Faisal Hub', from: 'Karsaz, Karachi', to: 'FTC Building, Shahrah-e-Faisal, Karachi' },
              { label: '🏥 Aga Khan Hospital', from: 'Hassan Square, Karachi', to: 'Aga Khan Hospital (AKUH), Karachi' },
              { label: '🌆 Malir Express ⇄ DHA', from: 'Malir Cantt, Karachi', to: 'DHA Phase 6, Karachi' },
            ].map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  setFromLocation(c.from);
                  setToLocation(c.to);
                  onToast(`Loaded corridor: ${c.label}`);
                }}
                className="bg-slate-800/80 hover:bg-slate-700 text-sky-200 px-2.5 py-1 rounded-lg font-bold shrink-0 border border-slate-700 transition whitespace-nowrap cursor-pointer"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Route inputs with Smart Autocomplete */}
        <div className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl">
          <div>
            <label className="text-xs font-bold text-blue-300 block mb-1">From (Office / Pickup area)</label>
            <LocationAutocomplete
              value={fromLocation}
              onChange={setFromLocation}
              placeholder="Type e.g. Hassan Square, Clifton, NIPA..."
              icon="circle"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-blue-300 block mb-1">To (Home / Destination area)</label>
            <LocationAutocomplete
              value={toLocation}
              onChange={setToLocation}
              placeholder="Type e.g. DHA Phase 6, Model Colony..."
              icon="pin"
              required
            />
          </div>

          {/* DUAL RECOMMENDED PICKUP HOTSPOT OPTIONS (Shortest vs Second Shortest) + MANUAL */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <RouteIcon className="w-4 h-4 text-blue-400" />
                Select Corridor & Recommended Hotspot:
              </label>
              <span className="text-[10px] bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-800">
                2 Route Options
              </span>
            </div>

            {/* Option 1: Shortest Route */}
            <div
              onClick={() => setHotspotSelectionMode('shortest')}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                hotspotSelectionMode === 'shortest'
                  ? 'border-blue-500 bg-blue-950/80 shadow-md'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    hotspotSelectionMode === 'shortest' ? 'border-blue-400 bg-blue-600' : 'border-slate-600'
                  }`}>
                    {hotspotSelectionMode === 'shortest' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white flex items-center gap-1.5">
                      1. {hotspotOptions.shortest.title}
                      <span className="text-[10px] font-extrabold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                        Fastest
                      </span>
                    </p>
                    <p className="text-xs font-semibold text-blue-200 mt-0.5">
                      📍 Hotspot: <strong>{hotspotOptions.shortest.hotspotName}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-400">{hotspotOptions.shortest.distanceKm} km</span>
                  <span className="text-[11px] text-slate-400 block font-medium">~{hotspotOptions.shortest.estMinutes} mins</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 pl-6 font-medium">
                {hotspotOptions.shortest.corridorDescription}
              </p>
            </div>

            {/* Option 2: Second Shortest Route */}
            <div
              onClick={() => setHotspotSelectionMode('second_shortest')}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                hotspotSelectionMode === 'second_shortest'
                  ? 'border-blue-500 bg-blue-950/80 shadow-md'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    hotspotSelectionMode === 'second_shortest' ? 'border-blue-400 bg-blue-600' : 'border-slate-600'
                  }`}>
                    {hotspotSelectionMode === 'second_shortest' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white flex items-center gap-1.5">
                      2. {hotspotOptions.secondShortest.title}
                      <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-1.5 py-0.2 rounded border border-blue-800">
                        Alternative
                      </span>
                    </p>
                    <p className="text-xs font-semibold text-blue-200 mt-0.5">
                      📍 Hotspot: <strong>{hotspotOptions.secondShortest.hotspotName}</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-400">{hotspotOptions.secondShortest.distanceKm} km</span>
                  <span className="text-[11px] text-slate-400 block font-medium">~{hotspotOptions.secondShortest.estMinutes} mins</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 pl-6 font-medium">
                {hotspotOptions.secondShortest.corridorDescription}
              </p>
            </div>

            {/* Option 3: Manual Custom Hotspot Box */}
            <div
              onClick={() => setHotspotSelectionMode('manual')}
              className={`p-3 rounded-xl border-2 transition-all ${
                hotspotSelectionMode === 'manual'
                  ? 'border-blue-500 bg-blue-950/80 shadow-md'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 cursor-pointer mb-1.5">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  hotspotSelectionMode === 'manual' ? 'border-blue-400 bg-blue-600' : 'border-slate-600'
                }`}>
                  {hotspotSelectionMode === 'manual' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  3. Enter Manual Custom Hotspot Address:
                </span>
              </div>
              <input
                type="text"
                value={manualHotspotText}
                onFocus={() => setHotspotSelectionMode('manual')}
                onChange={(e) => {
                  setManualHotspotText(e.target.value);
                  setHotspotSelectionMode('manual');
                }}
                placeholder="e.g. Near Shell Pump Gate, Nursery Flyover Service Lane..."
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 text-xs font-semibold border border-slate-800 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Intercity Luggage Option */}
          {isIntercity && (
            <div className="pt-2 border-t border-slate-800 bg-slate-950/80 p-2.5 rounded-xl border border-blue-900/60">
              <label className="text-xs font-bold text-blue-300 flex items-center gap-1">
                <Luggage className="w-3.5 h-3.5 text-blue-400" /> Intercity Luggage Policy
              </label>
              <input
                type="text"
                value={luggageAllowance}
                onChange={(e) => setLuggageAllowance(e.target.value)}
                placeholder="e.g. 🧳 1 Suitcase allowed per seat"
                className="mt-1 w-full bg-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white border border-slate-700 outline-none"
              />
            </div>
          )}

          {/* AVAILABLE DEPARTURE BAR TAB & TIMING SELECTION */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <label className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Available Departure Status
                </label>
              </div>
              <span className="text-[10px] bg-blue-950 text-blue-300 font-bold px-2.5 py-0.5 rounded-full border border-blue-800">
                {departureMode !== 'scheduled' ? '⚡ Real-Time Active' : '📅 Scheduled'}
              </span>
            </div>

            {/* "AVAILABLE" Main Tab Switcher Bar */}
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setDepartureMode('now');
                  setTime('⚡ Leaving Now');
                }}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  departureMode !== 'scheduled'
                    ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>AVAILABLE NOW</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDepartureMode('scheduled');
                  setTime('19:30');
                }}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  departureMode === 'scheduled'
                    ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>SCHEDULE LATER</span>
              </button>
            </div>

            {/* Timing Selection directly below "AVAILABLE" button tab */}
            {departureMode !== 'scheduled' ? (
              <div className="space-y-2 pt-1 bg-slate-950/80 p-3 rounded-xl border border-blue-900/50">
                <p className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Real-Time Departure Window:
                </p>

                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'now', label: '⚡ Now', val: '⚡ Leaving Now' },
                    { id: '5min', label: '⏱️ 5 mins', val: 'Leaving in 5 mins' },
                    { id: '15min', label: '⏱️ 15 mins', val: 'Leaving in 15 mins' },
                    { id: '30min', label: '⏱️ 30 mins', val: 'Leaving in 30 mins' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setDepartureMode(preset.id as any);
                        setTime(preset.val);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                        departureMode === preset.id
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-blue-200">
                  <span>Selected Departure: <strong>{time}</strong></span>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-bold">Instant Match</span>
                </div>
              </div>
            ) : (
              /* Scheduled Date & Time Pickers */
              <div className="grid grid-cols-2 gap-2 pt-1 bg-slate-950/80 p-3 rounded-xl border border-blue-900/50">
                <div>
                  <label className="text-xs font-bold text-blue-300 block mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 text-white rounded-xl px-2.5 py-2 text-xs font-medium outline-none border border-slate-800 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-blue-300 block mb-1">Departure Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-900 text-white rounded-xl px-2.5 py-2 text-xs font-medium outline-none border border-slate-800 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Route Preview */}
        <MapView
          fromLocation={fromLocation}
          toLocation={toLocation}
          waypoints={getRouteDetails(toLocation).waypoints}
          routeText={`${fromLocation} → ${toLocation}`}
        />

        {/* Vehicle Type Switcher */}
        <div>
          <label className="text-xs font-bold text-blue-300">Vehicle type</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleVehicleTypeChange('car')}
              className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition border-2 cursor-pointer ${
                vehicleType === 'car'
                  ? 'border-blue-500 bg-blue-950 text-blue-300 shadow-md'
                  : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Car className="w-4 h-4" /> Carpool
            </button>
            <button
              type="button"
              onClick={() => handleVehicleTypeChange('bike')}
              className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition border-2 cursor-pointer ${
                vehicleType === 'bike'
                  ? 'border-blue-500 bg-blue-950 text-blue-300 shadow-md'
                  : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Bike className="w-4 h-4" /> Motorbike
            </button>
          </div>

          {/* Bike Service Mode Option */}
          {vehicleType === 'bike' && (
            <div className="mt-3 bg-slate-900/90 p-3.5 rounded-2xl border border-blue-900/50 space-y-2">
              <label className="text-xs font-bold text-white block">Bike Offering Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setServiceCategory('passenger')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    serviceCategory === 'passenger'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>👤 Pillion Rider</span>
                  <span className="text-[10px] font-normal opacity-90">(1 Seat)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceCategory('parcel')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    serviceCategory === 'parcel'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>📦 Express Parcel</span>
                  <span className="text-[10px] font-normal opacity-90">(Max 5kg)</span>
                </button>
              </div>

              {serviceCategory === 'parcel' && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <label className="text-[11px] font-bold text-blue-300 block">Parcel Specification</label>
                  <input
                    type="text"
                    value={parcelDesc}
                    onChange={(e) => setParcelDesc(e.target.value)}
                    placeholder="e.g. Office Documents, Laptop bag, Envelope"
                    className="mt-1 w-full bg-slate-950 text-white rounded-xl px-3 py-2 text-xs font-medium outline-none border border-slate-800"
                    required
                  />
                  <p className="text-[10px] text-blue-300 mt-1 font-medium">
                    * Ideal for sending office documents, files, and laptop bags on your commute path.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vehicle Details Box */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Vehicle Specs & Reg Plate</p>
            {hasLoadedSavedVehicle && (
              <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-blue-800">
                <CheckCircle2 className="w-3 h-3 text-blue-400" /> Saved Vehicle Loaded
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 font-semibold">Model / Make</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Honda City / CG 125"
                className="mt-1 w-full bg-slate-950 text-white rounded-xl px-3 py-2 text-xs font-medium outline-none border border-slate-800"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-semibold">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2022"
                className="mt-1 w-full bg-slate-950 text-white rounded-xl px-3 py-2 text-xs font-medium outline-none border border-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 font-semibold">Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. White / Black"
                className="mt-1 w-full bg-slate-950 text-white rounded-xl px-3 py-2 text-xs font-medium outline-none border border-slate-800"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-300">Registration Plate #</label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="e.g. KHI-7890"
                className="mt-1 w-full bg-blue-950/80 rounded-xl px-3 py-2 text-xs font-bold text-blue-200 uppercase tracking-wider outline-none border border-blue-800"
                required
              />
            </div>
          </div>

          {vehicleType === 'car' && (
            <div className="flex gap-4 pt-1 flex-wrap">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acAvailable}
                  onChange={(e) => setAcAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                Air Conditioning (AC)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heaterAvailable}
                  onChange={(e) => setHeaterAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                Heater
              </label>
            </div>
          )}

          {vehicleType === 'bike' && serviceCategory === 'passenger' && (
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-blue-900/50">
              <label className="flex items-center gap-2 text-xs font-bold text-blue-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={spareHelmetProvided}
                  onChange={(e) => setSpareHelmetProvided(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                ⛑️ Driver Provides Spare Helmet for Passenger (Safety Standard)
              </label>
            </div>
          )}

          {/* Payment Methods Accepted */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Accepted Payment Methods
            </label>
            <div className="flex flex-wrap gap-2">
              {['Cash', 'JazzCash', 'EasyPaisa', 'Bank Transfer'].map((pm) => {
                const isSelected = acceptedPayments.includes(pm);
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (acceptedPayments.length > 1) {
                          setAcceptedPayments(acceptedPayments.filter((p) => p !== pm));
                        }
                      } else {
                        setAcceptedPayments([...acceptedPayments, pm]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {pm === 'Cash' ? '💵 Cash' : pm === 'JazzCash' ? '📱 JazzCash' : pm === 'EasyPaisa' ? '💳 EasyPaisa' : '🏛️ Bank Transfer'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Vehicle Profile Toggle & Button */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={saveVehicleProfile}
                onChange={(e) => setSaveVehicleProfile(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
              Save & Auto-fill for future rides
            </label>
            <button
              type="button"
              onClick={handleManualSaveVehicle}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-lg transition border border-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <Bookmark className="w-3 h-3 text-blue-400" /> Save Now
            </button>
          </div>
        </div>

        {/* Capacity / Vacant Seats */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-white block">
              {vehicleType === 'bike' ? '🏍️ Pillion Seat Availability' : '🚗 Vacant Seats Capacity'}
            </label>
            <p className="text-[11px] text-slate-400 font-medium">
              {vehicleType === 'bike' ? 'Share your ride with 1 passenger commuter' : 'Number of passengers you can accommodate'}
            </p>
          </div>
          <select
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="bg-slate-950 font-bold text-xs text-white rounded-xl px-3 py-2 outline-none border border-slate-800 focus:border-blue-500 cursor-pointer"
          >
            {vehicleType === 'bike' ? (
              <option value={1} className="bg-slate-900 text-white">1 seat (1 Rider)</option>
            ) : (
              <>
                <option value={1} className="bg-slate-900 text-white">1 seat</option>
                <option value={2} className="bg-slate-900 text-white">2 seats</option>
                <option value={3} className="bg-slate-900 text-white">3 seats</option>
                <option value={4} className="bg-slate-900 text-white">4 seats</option>
              </>
            )}
          </select>
        </div>

        {/* Fare & Cost-Share Pricing Engine */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">Cost-share fare per seat</h3>
            <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full font-bold border border-blue-800">
              {vehicleType === 'bike' ? (serviceCategory === 'parcel' ? '📦 Parcel Rate' : '🏍️ Bike Rate') : '🚗 Carpool Rate'}
            </span>
          </div>

          {/* Prominent Per KM Cost Rate Banner in Rs */}
          <div className="bg-gradient-to-r from-slate-950 to-blue-950 border border-blue-900/60 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wide block">Rate per Kilometer</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-blue-400">₨ {perKmRate}</span>
                <span className="text-xs font-bold text-blue-300">/ km</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-white">₨ {totalPrice} total fare</span>
              <span className="text-[11px] text-slate-400 block font-medium">{distanceKm} km commute path</span>
            </div>
          </div>

          <div className="flex items-end justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Final Fare to Passenger</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-blue-400">₨ {totalPrice}</span>
                <span className="text-xs text-slate-400 font-bold">
                  {serviceCategory === 'parcel' && vehicleType === 'bike' ? '/ parcel' : '/ seat'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Per KM Breakdown</span>
              <span className="text-xs font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 inline-block">
                ₨ {perKmRate}/km
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Calculated fuel base share: <strong className="text-slate-200">₨ {basePrice}</strong>
          </p>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Driver Fare Adjustment Bar</span>
              <span className="text-blue-400 font-bold">
                {premium === 0 ? 'Standard Fuel Share' : premium > 0 ? `+₨ ${premium} Adjustment` : `-₨ ${Math.abs(premium)} Discount`}
              </span>
            </div>

            {/* Interactive Range Slider */}
            <input
              type="range"
              min="-50"
              max={vehicleType === 'car' ? 400 : 250}
              step="10"
              value={premium}
              onChange={(e) => setPremium(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Quick Adjustment Tap Buttons */}
            <div className="flex gap-1.5 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => setPremium(0)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                  premium === 0 ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Base Share (₨ {basePrice})
              </button>
              
              {vehicleType === 'car' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPremium(50)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                      premium === 50 ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    +₨ 50 (AC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPremium(100)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                      premium === 100 ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    +₨ 100 (Express Toll)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPremium(150)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                      premium === 150 ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    +₨ 150 (Peak Rush)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPremium(200)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                      premium === 200 ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    +₨ 200 (Executive)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPremium(30)}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition cursor-pointer ${
                      premium === 30 ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    +₨ 30
                  </button>
                  <button
                    type="button"
                    onClick={() => setPremium(50)}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition cursor-pointer ${
                      premium === 50 ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    +₨ 50
                  </button>
                  <button
                    type="button"
                    onClick={() => setPremium(100)}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition cursor-pointer ${
                      premium === 100 ? 'bg-blue-600 text-white border-blue-500 shadow-sm' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    +₨ 100
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-2.5 bg-slate-950/80 rounded-xl flex items-start gap-2 border border-blue-900/50 text-xs text-blue-200">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-medium">
              Keep prices fair. PathShare is for commuting colleagues sharing costs, not a commercial taxi app.
            </p>
          </div>
        </div>

        {/* Preferences & Safety Options */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-blue-300">Preferences & Safety</label>

          {/* Women-Only Carpool Toggle */}
          <div className="bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-700/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌸</span>
              <div>
                <p className="text-xs font-bold text-pink-200">Women-Only Carpool</p>
                <p className="text-[10px] text-pink-300/80">Only female co-passengers can request this ride</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLadiesOnly(!ladiesOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                ladiesOnly
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-900/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-700'
              }`}
            >
              {ladiesOnly ? 'Active ✓' : 'Enable'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {availablePrefs.map((pref) => {
              const isSelected = selectedPrefs.includes(pref);
              return (
                <button
                  type="button"
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold border border-blue-500 shadow-sm'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                  {pref}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-xl shadow-blue-950/60 flex items-center justify-center gap-2 transition active:scale-98 text-sm cursor-pointer border border-blue-400/30"
        >
          <Send className="w-4 h-4" /> Publish ride live
        </button>
      </form>
    </div>
  );
};
