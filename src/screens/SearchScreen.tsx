import React, { useState, useMemo } from 'react';
import { Circle, MapPin, Clock, Search, Filter, Compass } from 'lucide-react';
import { Ride, FilterType } from '../types';
import { RideCard } from '../components/RideCard';
import { MapView } from '../components/MapView';
import { LocationAutocomplete } from '../components/LocationAutocomplete';

interface SearchScreenProps {
  rides: Ride[];
  homeDestination?: string;
  onSetHomeDestination?: (dest: string) => void;
  onSelectRide: (ride: Ride) => void;
  onToast: (msg: string) => void;
  onNavigateHome?: () => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  rides,
  homeDestination = 'DHA Phase 6, Karachi',
  onSetHomeDestination,
  onSelectRide,
  onToast
}) => {
  const [fromQuery, setFromQuery] = useState('Clifton, Karachi');
  const [toQuery, setToQuery] = useState(homeDestination);
  const [timeFilter, setTimeFilter] = useState('Half an hour');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('19:00');
  const [activeFilter, setActiveFilter] = useState<FilterType | 'intercity' | 'ladiesOnly'>('all');

  // Keep toQuery in sync if homeDestination changes externally
  React.useEffect(() => {
    if (homeDestination) {
      setToQuery(homeDestination);
    }
  }, [homeDestination]);

  const filteredRides = useMemo(() => {
    let list = [...rides];

    // Filter by type or criteria
    if (activeFilter === 'car') {
      list = list.filter(r => r.type === 'car');
    } else if (activeFilter === 'bike') {
      list = list.filter(r => r.type === 'bike');
    } else if (activeFilter === 'intercity') {
      list = list.filter(r => r.intercity);
    } else if (activeFilter === 'ladiesOnly') {
      list = list.filter(r => r.ladiesOnly);
    } else if (activeFilter === 'fare') {
      list.sort((a, b) => a.price - b.price);
    } else if (activeFilter === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    const cleanTo = toQuery.toLowerCase().replace(', karachi', '').trim();
    const cleanFrom = fromQuery.toLowerCase().replace(', karachi', '').trim();

    // 1. If both from and to are specified, match en-route paths
    if (cleanTo || cleanFrom) {
      const matchScore = (r: Ride) => {
        let score = 0;
        const allText = `${r.from} ${r.to} ${r.route} ${r.via.join(' ')} ${r.pickupHotspot || ''}`.toLowerCase();
        
        if (cleanTo && (r.to.toLowerCase().includes(cleanTo) || r.via.some(v => v.toLowerCase().includes(cleanTo)))) {
          score += 5;
        } else if (cleanTo && allText.includes(cleanTo)) {
          score += 3;
        }

        if (cleanFrom && (r.from.toLowerCase().includes(cleanFrom) || r.via.some(v => v.toLowerCase().includes(cleanFrom)) || (r.pickupHotspot && r.pickupHotspot.toLowerCase().includes(cleanFrom)))) {
          score += 5;
        } else if (cleanFrom && allText.includes(cleanFrom)) {
          score += 2;
        }

        return score;
      };

      const scored = list
        .map(r => ({ ride: r, score: matchScore(r) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

      if (scored.length > 0) {
        return scored.map(item => item.ride);
      }
    }

    return list;
  }, [rides, activeFilter, toQuery, fromQuery]);

  const handleSearch = () => {
    const timeLabel = timeFilter === 'custom' ? `at ${customTime}` : timeFilter;
    if (onSetHomeDestination && toQuery.trim()) {
      onSetHomeDestination(toQuery);
      onToast(`Corridor synchronized: ${fromQuery} → ${toQuery} (${timeLabel})`);
    } else {
      onToast(`Searched rides: ${fromQuery} → ${toQuery} (${timeLabel})`);
    }
  };

  const handleTimeChange = (val: string) => {
    setTimeFilter(val);
    setShowCustomTime(val === 'custom');
  };

  const filters: { id: FilterType | 'intercity' | 'ladiesOnly'; label: string }[] = [
    { id: 'all', label: 'All Rides' },
    { id: 'ladiesOnly', label: '🌸 Women-Only Carpool' },
    { id: 'car', label: '🚗 Carpool' },
    { id: 'bike', label: '🏍️ Bike Ride' },
    { id: 'intercity', label: '🛣️ Intercity' },
    { id: 'fare', label: 'Lowest Fare' },
    { id: 'rating', label: 'Highest Rating' },
  ];

  return (
    <div className="pb-24 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 min-h-screen text-slate-100">
      {/* Header Form */}
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-blue-900/40 p-4 sticky top-0 z-20 shadow-2xl">
        <h2 className="text-lg font-bold text-white">Find a ride</h2>
        <div className="mt-3 space-y-2">
          <div>
            <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wide block mb-1">Pickup Location</label>
            <LocationAutocomplete
              value={fromQuery}
              onChange={setFromQuery}
              placeholder="Your pickup area (e.g. Clifton, Hassan Square)"
              icon="circle"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-blue-300 uppercase tracking-wide block mb-1">Destination Location</label>
            <LocationAutocomplete
              value={toQuery}
              onChange={setToQuery}
              placeholder="Where are you going? (e.g. Safoora Chowrangi, DHA Phase 6)"
              icon="pin"
            />
          </div>

          {/* Soft Launch Karachi Target Corridors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-sky-300 font-extrabold shrink-0">🚀 Target Corridors:</span>
            {[
              { label: '🎓 IBA / NED University', from: 'Gulshan-e-Iqbal, Karachi', to: 'University Road (NED/KU), Karachi' },
              { label: '💼 Clifton ⇄ Chundrigar', from: 'Clifton, Karachi', to: 'I.I. Chundrigar Road, Karachi' },
              { label: '🏢 Shahrah-e-Faisal Hub', from: 'Karsaz, Karachi', to: 'FTC Building, Shahrah-e-Faisal, Karachi' },
              { label: '🏥 Aga Khan & Liaquat', from: 'Hassan Square, Karachi', to: 'Aga Khan Hospital (AKUH), Karachi' },
              { label: '🌆 Malir Express ⇄ DHA', from: 'Malir Cantt, Karachi', to: 'DHA Phase 6, Karachi' },
            ].map((corridor) => (
              <button
                key={corridor.label}
                type="button"
                onClick={() => {
                  setFromQuery(corridor.from);
                  setToQuery(corridor.to);
                  onToast(`Activated corridor: ${corridor.label}`);
                }}
                className="bg-blue-950/80 hover:bg-blue-900 text-sky-200 px-2.5 py-1 rounded-lg font-bold shrink-0 border border-blue-800 transition whitespace-nowrap cursor-pointer"
              >
                {corridor.label}
              </button>
            ))}
          </div>

          {/* Quick Hub & Hospital Selector Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-slate-400 font-bold shrink-0">Popular:</span>
            {[
              'Jinnah Hospital (JPMC)',
              'Safoora Chowrangi',
              'Surjani Town',
              'Saadi Town',
              'Malir Checkpost Number 6',
              'Quaidabad',
              'Karsaz',
              'DHA Phase 6',
              'Hassan Square',
              'Lines Area',
              'Aga Khan Hospital (AKUH)',
              'Indus Hospital Korangi',
              'Civil Hospital Karachi (CHK)'
            ].map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => {
                  setToQuery(place.includes('Karachi') ? place : `${place}, Karachi`);
                  onToast(`Selected destination: ${place}`);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-semibold shrink-0 border border-slate-800 transition whitespace-nowrap cursor-pointer"
              >
                {place}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2.5 border border-slate-800">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              <select
                id="search-time-filter-select"
                value={timeFilter}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="bg-transparent flex-1 outline-none text-xs sm:text-sm font-medium text-white cursor-pointer"
              >
                <option value="Half an hour" className="bg-slate-900 text-white">Half an hour</option>
                <option value="Within an hour" className="bg-slate-900 text-white">Within an hour</option>
                <option value="Within two hours" className="bg-slate-900 text-white">Within two hours</option>
                <option value="custom" className="bg-slate-900 text-white">Custom time</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-1 shrink-0 cursor-pointer shadow-md shadow-blue-950/50 border border-blue-400/30"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>

          {showCustomTime && (
            <div className="pt-1">
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full bg-slate-900 text-white rounded-xl px-3 py-2 text-xs font-medium outline-none border border-slate-800"
              />
            </div>
          )}
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-md mx-auto">
        {/* Dynamic Interactive GPS Route Map */}
        <MapView
          fromLocation={fromQuery}
          toLocation={toQuery}
          routeText={`${fromQuery} → ${toQuery}`}
        />

        {/* Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id);
                  onToast(`Filter: ${f.label}`);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md border border-blue-400/30'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search Results */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold px-0.5">
            <span>{filteredRides.length} ride(s) available</span>
            <span>Sorted by suitability</span>
          </div>

          {filteredRides.length === 0 ? (
            <div className="bg-slate-900/80 rounded-2xl p-8 text-center text-slate-400 space-y-2 border border-slate-800">
              <Filter className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="font-semibold text-sm text-slate-200">No rides found matching filters</p>
              <p className="text-xs text-slate-400">Try changing your destination or filter settings.</p>
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setToQuery('');
                }}
                className="mt-2 text-xs font-bold text-blue-300 bg-blue-950 px-3 py-1.5 rounded-lg border border-blue-800 cursor-pointer hover:bg-blue-900"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} onClick={onSelectRide} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};
