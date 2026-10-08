import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Compass, Loader2 } from 'lucide-react';
import { LocationInfo } from '../types/weather';

interface LocationSearchProps {
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  isLoading: boolean;
  onRequestGeolocation: () => void;
}

const PRESET_CITIES: LocationInfo[] = [
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { city: 'Honolulu', country: 'Hawaii, USA', latitude: 21.3069, longitude: -157.8583 },
  { city: 'Anchorage', country: 'Alaska, USA', latitude: 61.2181, longitude: -149.9003 },
  { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
];

export const LocationSearch: React.FC<LocationSearchProps> = ({
  currentLocation,
  onSelectLocation,
  isLoading,
  onRequestGeolocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/weather/geocode?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const results = await res.json();
          const mapped: LocationInfo[] = (results || []).map((r: any) => ({
            city: r.name,
            country: r.country,
            admin1: r.admin1,
            latitude: r.latitude,
            longitude: r.longitude,
          }));
          setSuggestions(mapped);
        }
      } catch (err) {
        console.error('Failed to geocode query:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (loc: LocationInfo) => {
    setSearchTerm('');
    setSuggestions([]);
    onSelectLocation(loc);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Active Location Badge + GPS Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-sky-50 px-3.5 py-2 rounded-xl text-sky-800 font-semibold text-sm">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              {currentLocation.city}
              {currentLocation.country ? `, ${currentLocation.country}` : ''}
            </span>
          </div>

          <button
            onClick={onRequestGeolocation}
            disabled={isLoading}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-3.5 py-2 rounded-xl text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Locate my city using GPS"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>Current Location</span>
          </button>
        </div>

        {/* Center/Right: Search bar */}
        <div className="relative flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search another city or town..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-sky-400 focus:bg-white rounded-xl py-2 pl-9 pr-8 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-sky-500 absolute right-3 top-2.5 animate-spin" />
            )}
          </div>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-sky-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={`${item.city}-${item.latitude}-${idx}`}
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-sky-50 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-700">{item.city}</span>
                  <span className="text-xs text-slate-500">
                    {item.admin1 ? `${item.admin1}, ` : ''}
                    {item.country || ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick city suggestions */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
          <Compass className="w-3 h-3" /> Quick Explore:
        </span>
        {PRESET_CITIES.map((city) => (
          <button
            key={city.city}
            onClick={() => onSelectLocation(city)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-800 font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {city.city}
          </button>
        ))}
      </div>
    </div>
  );
};
