import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Building2, GraduationCap, Compass, X, HeartPulse } from 'lucide-react';
import { LocationItem, searchLocations } from '../data/locations';

interface LocationAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectLocation?: (item: LocationItem) => void;
  placeholder?: string;
  label?: string;
  icon?: 'pin' | 'circle' | 'search';
  required?: boolean;
  className?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onSelectLocation,
  placeholder = 'Enter landmark or area name...',
  label,
  icon = 'pin',
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length >= 1) {
      const results = searchLocations(value, 8);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: LocationItem) => {
    onChange(item.name);
    if (onSelectLocation) {
      onSelectLocation(item);
    }
    setIsOpen(false);
  };

  const getCategoryBadge = (cat: LocationItem['category']) => {
    switch (cat) {
      case 'hospital':
        return <span className="bg-rose-950 text-rose-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-rose-800">Hospital</span>;
      case 'transit':
        return <span className="bg-blue-950 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-blue-800">Hub</span>;
      case 'society':
        return <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-slate-700">Society</span>;
      case 'commercial':
        return <span className="bg-purple-950 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-purple-800">Market</span>;
      case 'university':
        return <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-amber-800">Edu</span>;
      case 'intercity':
        return <span className="bg-blue-950 text-blue-200 text-[10px] px-1.5 py-0.5 rounded font-bold border border-blue-800">M-9 Highway</span>;
      default:
        return null;
    }
  };

  const renderIcon = () => {
    if (icon === 'circle') return <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 bg-blue-950 shrink-0" />;
    if (icon === 'search') return <Compass className="w-4 h-4 text-slate-400 shrink-0" />;
    return <MapPin className="w-4 h-4 text-blue-400 shrink-0" />;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-300 mb-1">{label}</label>}

      <div className="relative flex items-center bg-slate-900 rounded-xl px-3 py-2 border border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-900/50 transition">
        <div className="mr-2">{renderIcon()}</div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder:text-slate-500"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
            }}
            className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Smart Dropdown Autocomplete Menu */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-h-60 overflow-y-auto divide-y divide-slate-800">
          <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Locations</span>
            <span className="text-[10px] text-blue-400 font-bold">{suggestions.length} matches</span>
          </div>

          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2.5 hover:bg-slate-800/90 transition flex items-start justify-between gap-2 group cursor-pointer"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg transition shrink-0 mt-0.5 ${
                  item.category === 'hospital'
                    ? 'bg-rose-950 text-rose-400 group-hover:bg-rose-900'
                    : 'bg-slate-800 group-hover:bg-blue-950 text-slate-400 group-hover:text-blue-300'
                }`}>
                  {item.category === 'hospital' ? (
                    <HeartPulse className="w-3.5 h-3.5" />
                  ) : item.category === 'university' ? (
                    <GraduationCap className="w-3.5 h-3.5" />
                  ) : item.category === 'commercial' ? (
                    <Building2 className="w-3.5 h-3.5" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300 truncate">
                    {item.shortName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{item.name}</p>
                </div>
              </div>

              <div className="shrink-0 mt-0.5">{getCategoryBadge(item.category)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
