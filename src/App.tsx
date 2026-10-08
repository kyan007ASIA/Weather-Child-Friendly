import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TopNav } from './components/TopNav';
import { LocationSearch } from './components/LocationSearch';
import { CurrentWeatherHero } from './components/CurrentWeatherHero';
import { ForecastThreeDays } from './components/ForecastThreeDays';
import { WardrobeHelper } from './components/WardrobeHelper';
import { PlaytimeMeter } from './components/PlaytimeMeter';
import { McpInspectorModal } from './components/McpInspectorModal';
import { WeatherData, LocationInfo } from './types/weather';
import { interpretWeatherForKids, cToF } from './utils/weatherInterpreter';
import { Clock, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

const DEFAULT_LOCATION: LocationInfo = {
  city: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.006,
};

export default function App() {
  const [location, setLocation] = useState<LocationInfo>(() => {
    const saved = localStorage.getItem('weatherbuddy_loc');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => {
    return (localStorage.getItem('weatherbuddy_unit') as 'C' | 'F') || 'C';
  });

  const [smitheryToken, setSmitheryToken] = useState<string>(() => {
    return localStorage.getItem('weatherbuddy_smithery_token') || '';
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);

  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch weather data from our server API (which invokes MCP endpoint kyan007 and falls back to live engine)
  const fetchWeather = useCallback(
    async (loc: LocationInfo) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          lat: loc.latitude.toString(),
          lon: loc.longitude.toString(),
          city: loc.city,
        });

        if (smitheryToken) {
          queryParams.append('token', smitheryToken);
        }

        const res = await fetch(`/api/weather?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Weather service returned ${res.status}`);
        }

        const data: WeatherData = await res.json();
        setWeatherData(data);
        localStorage.setItem('weatherbuddy_loc', JSON.stringify(loc));
      } catch (err: unknown) {
        console.error('Error fetching weather:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to connect to weather monitor. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [smitheryToken]
  );

  // Initial load
  useEffect(() => {
    fetchWeather(location);
  }, [location, fetchWeather]);

  // Request HTML5 geolocation
  const handleRequestGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        let detectedCity = 'Your Location';
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            detectedCity = geoData.locality || geoData.city || 'Your Location';
          }
        } catch {
          // ignore reverse geocode fail, use fallback title
        }

        const newLoc: LocationInfo = {
          city: detectedCity,
          latitude: lat,
          longitude: lon,
        };
        setLocation(newLoc);
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        setIsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Toggle °C / °F
  const handleToggleUnit = () => {
    setTempUnit((prev) => {
      const next = prev === 'C' ? 'F' : 'C';
      localStorage.setItem('weatherbuddy_unit', next);
      return next;
    });
  };

  // Save Smithery Token
  const handleSaveToken = (token: string) => {
    setSmitheryToken(token);
    localStorage.setItem('weatherbuddy_smithery_token', token);
  };

  // Text-To-Speech for Kids
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!weatherData) return;

    const interpretation = interpretWeatherForKids(
      weatherData.current.weather_code,
      weatherData.current.temperature_2m,
      weatherData.current.is_day,
      weatherData.current.wind_speed_10m
    );

    const tempVal =
      tempUnit === 'F'
        ? `${cToF(weatherData.current.temperature_2m)} degrees Fahrenheit`
        : `${Math.round(weatherData.current.temperature_2m)} degrees Celsius`;

    const outfit = interpretation.clothingSuggestions[0]?.name || 'a comfortable outfit';

    const storyText = `Hello little explorer! Here is today's Weather Buddy report for ${location.city}! Today the sky is ${interpretation.simpleTitle}. The temperature is ${tempVal}, which feels like ${interpretation.kidFriendlyTempFeeling}. Buddy's advice: ${interpretation.playAdvice}. Don't forget to wear your ${outfit}! Have a wonderful, fun-filled day!`;

    const utterance = new SpeechSynthesisUtterance(storyText);
    utterance.rate = 0.95;
    utterance.pitch = 1.1; // Cheerful friendly pitch

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Compute interpretation for current weather
  const currentInterpretation = weatherData
    ? interpretWeatherForKids(
        weatherData.current.weather_code,
        weatherData.current.temperature_2m,
        weatherData.current.is_day,
        weatherData.current.wind_speed_10m
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-sky-50/40 text-slate-800">
      {/* Top Navbar */}
      <TopNav
        tempUnit={tempUnit}
        onToggleUnit={handleToggleUnit}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        onOpenMcp={() => setIsMcpModalOpen(true)}
        mcpConnected={!!weatherData?.mcpDiagnostics?.mcpOk}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Location search & GPS bar */}
        <LocationSearch
          currentLocation={location}
          onSelectLocation={(loc) => setLocation(loc)}
          isLoading={isLoading}
          onRequestGeolocation={handleRequestGeolocation}
        />

        {/* Error message if any */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchWeather(location)}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !weatherData && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-sky-500 animate-spin mb-3" />
            <h3 className="text-xl font-bold font-fun text-slate-700">
              Asking Weather Buddy for today's forecast...
            </h3>
            <p className="text-xs text-slate-400 mt-1">Connecting to MCP endpoint & live satellites</p>
          </div>
        )}

        {/* Loaded Weather Content */}
        {weatherData && currentInterpretation && (
          <>
            {/* 1. Hero Current Weather */}
            <CurrentWeatherHero
              current={weatherData.current}
              location={location}
              interpretation={currentInterpretation}
              tempUnit={tempUnit}
              onSpeak={handleToggleSpeech}
              isSpeaking={isSpeaking}
            />

            {/* 2. Today's Hourly Journey for Kids */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-sm mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-fun text-slate-800">
                      Today's Hourly Journey
                    </h3>
                    <p className="text-xs text-slate-500">
                      See how the sky changes from morning to bedtime
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Hourly Strip */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                {weatherData.hourly.time.slice(0, 12).map((timeStr, idx) => {
                  const hourDate = new Date(timeStr);
                  const hourLabel = hourDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true,
                  });
                  const tempVal = weatherData.hourly.temperature_2m[idx];
                  const code = weatherData.hourly.weather_code[idx];
                  const hourlyInterp = interpretWeatherForKids(code, tempVal, 1);
                  const displayTemp = tempUnit === 'F' ? cToF(tempVal) : Math.round(tempVal);

                  return (
                    <div
                      key={timeStr}
                      className="flex flex-col items-center justify-between min-w-[85px] p-3 rounded-2xl bg-sky-50/60 hover:bg-sky-100/70 border border-sky-100/80 transition-colors text-center shrink-0"
                    >
                      <span className="text-[11px] font-bold text-slate-500">{hourLabel}</span>
                      <span className="text-2xl my-1.5">{code === 0 ? '☀️' : code < 4 ? '⛅' : code < 70 ? '🌧️' : '❄️'}</span>
                      <span className="text-sm font-extrabold font-fun text-slate-800 tabular-nums">
                        {displayTemp}°
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Next 3 Days Forecast */}
            <ForecastThreeDays daily={weatherData.daily} tempUnit={tempUnit} />

            {/* 4. Interactive Dress-Up / Wardrobe Helper */}
            <WardrobeHelper interpretation={currentInterpretation} />

            {/* 5. Playtime Meter & Science Fun Fact */}
            <PlaytimeMeter interpretation={currentInterpretation} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-sky-100 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-fun text-slate-600 font-bold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>WeatherBuddy — Built with care for curious kids & families</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>MCP Endpoint: https://mcp.smithery.ai/kyan007</span>
            <span>·</span>
            <button
              onClick={() => setIsMcpModalOpen(true)}
              className="text-sky-600 hover:underline cursor-pointer font-sans"
            >
              Connection Details
            </button>
          </div>
        </div>
      </footer>

      {/* MCP Inspector Modal */}
      <McpInspectorModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        mcpDiagnostics={weatherData?.mcpDiagnostics}
        smitheryToken={smitheryToken}
        onSaveToken={handleSaveToken}
        onRefreshWeather={() => fetchWeather(location)}
      />
    </div>
  );
}
