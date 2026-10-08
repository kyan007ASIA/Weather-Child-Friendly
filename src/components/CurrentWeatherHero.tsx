import React, { useState } from 'react';
import {
  Volume2,
  Wind,
  Droplets,
  Sun,
  CloudSun,
  Smile,
  Sparkles,
  Info,
} from 'lucide-react';
import { CurrentWeather, KidWeatherInterpretation, LocationInfo } from '../types/weather';
import { cToF } from '../utils/weatherInterpreter';

import sunnyMascot from '../assets/images/weather_sunny_mascot_1791427516179.jpg';
import rainyMascot from '../assets/images/weather_rainy_mascot_1791427528781.jpg';
import snowyMascot from '../assets/images/weather_snowy_mascot_1791427541809.jpg';
import heroLandscape from '../assets/images/weather_hero_landscape_1791427553424.jpg';

interface CurrentWeatherHeroProps {
  current: CurrentWeather;
  location: LocationInfo;
  interpretation: KidWeatherInterpretation;
  tempUnit: 'C' | 'F';
  onSpeak: () => void;
  isSpeaking: boolean;
}

const MASCOT_JOKES = [
  "What falls in winter but never gets hurt? Snow! ❄️",
  "What did one raindrop say to the other? Two's company, three's a cloud! 🌧️",
  "Why did the sun go to school? To get a little brighter! ☀️",
  "How do hurricanes see where they're going? With their eye! 🌀",
  "What goes up when rain comes down? An umbrella! ☂️",
  "Why did the weather report visit the bank? To check the cloud balance! ☁️",
];

export const CurrentWeatherHero: React.FC<CurrentWeatherHeroProps> = ({
  current,
  location,
  interpretation,
  tempUnit,
  onSpeak,
  isSpeaking,
}) => {
  const [mascotBounce, setMascotBounce] = useState(false);
  const [activeJokeIndex, setActiveJokeIndex] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);

  // Mascot selection
  let mascotImage = sunnyMascot;
  let mascotAlt = 'Sunny mascot';
  if (interpretation.mascotType === 'rainy') {
    mascotImage = rainyMascot;
    mascotAlt = 'Rainy mascot with umbrella';
  } else if (interpretation.mascotType === 'snowy') {
    mascotImage = snowyMascot;
    mascotAlt = 'Snowy mascot with scarf';
  } else if (interpretation.mascotType === 'cloudy') {
    mascotImage = rainyMascot;
    mascotAlt = 'Cloudy mascot';
  }

  const handleMascotClick = () => {
    setMascotBounce(true);
    setShowSpeechBubble(true);
    setActiveJokeIndex((prev) => (prev + 1) % MASCOT_JOKES.length);
    setTimeout(() => setMascotBounce(false), 600);
  };

  const displayTemp =
    tempUnit === 'F'
      ? cToF(current.temperature_2m)
      : Math.round(current.temperature_2m);

  const displayFeelsLike =
    tempUnit === 'F'
      ? cToF(current.apparent_temperature)
      : Math.round(current.apparent_temperature);

  return (
    <div
      id="current"
      className="relative rounded-3xl overflow-hidden border border-sky-100 shadow-md bg-white mb-8"
    >
      {/* Decorative top landscape banner */}
      <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-sky-100">
        <img
          src={heroLandscape}
          alt="Playful sunny meadow landscape"
          className="w-full h-full object-cover object-bottom opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-2 bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span className="text-xs font-bold text-slate-700">Live Weather Radar for Kids</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Mascot & Interactive Speech */}
          <div className="lg:col-span-5 flex flex-col items-center text-center">
            <div className="relative inline-block cursor-pointer" onClick={handleMascotClick}>
              {/* Mascot Avatar with gentle float / bounce animation */}
              <div
                className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2 bg-gradient-to-b from-amber-200 to-sky-200 shadow-lg ring-4 ring-white transition-transform duration-300 ${
                  mascotBounce ? 'scale-110 -rotate-3' : 'animate-float-slow'
                }`}
              >
                <img
                  src={mascotImage}
                  alt={mascotAlt}
                  className="w-full h-full rounded-full object-cover shadow-inner"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Click me badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 hover:bg-amber-300 text-amber-950 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1 cursor-pointer whitespace-nowrap">
                <Smile className="w-3.5 h-3.5" />
                <span>Tap Me!</span>
              </div>
            </div>

            {/* Mascot speech bubble */}
            <div className="mt-4 max-w-xs">
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 text-xs sm:text-sm text-sky-900 font-semibold shadow-xs relative">
                <p>
                  {showSpeechBubble
                    ? MASCOT_JOKES[activeJokeIndex]
                    : `Hi! I'm your Weather Buddy in ${location.city}! ${interpretation.tagline}`}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Large Kid-Friendly Weather Readings */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Weather title & city */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  Current Condition
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-fun text-slate-800 leading-tight">
                  {interpretation.simpleTitle}
                </h2>
              </div>

              {/* Speak button */}
              <button
                onClick={onSpeak}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-400 text-amber-950 animate-pulse'
                    : 'bg-sky-600 hover:bg-sky-700 text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? 'Listening...' : 'Hear Weather Story'}</span>
              </button>
            </div>

            {/* Giant Temperature display */}
            <div className="flex items-baseline gap-4 my-3">
              <span className="text-6xl sm:text-7xl font-extrabold font-fun text-slate-900 tracking-tight tabular-nums">
                {displayTemp}°{tempUnit}
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-bold">FEELS LIKE</span>
                <span className="text-lg font-bold text-slate-700 tabular-nums">
                  {displayFeelsLike}°{tempUnit}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {interpretation.kidFriendlyTempFeeling}
                </span>
              </div>
            </div>

            {/* Kid advice banner */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3.5 rounded-r-2xl mb-5">
              <p className="text-xs sm:text-sm font-semibold text-amber-900">
                ⭐ <strong className="font-bold">Buddy's Tip:</strong> {interpretation.playAdvice}
              </p>
            </div>

            {/* 4 Fun Kid Meters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Rain Chance */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Rain</span>
                <span className="text-base font-extrabold font-fun text-slate-800">
                  {current.precipitation > 0 ? `${current.precipitation} mm` : 'Dry Sky ☀️'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {current.precipitation > 0 ? 'Splashing puddles!' : 'No umbrella needed'}
                </span>
              </div>

              {/* Wind Speed */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Wind className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Breeze</span>
                <span className="text-base font-extrabold font-fun text-slate-800 tabular-nums">
                  {Math.round(current.wind_speed_10m)} km/h
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {current.wind_speed_10m > 15 ? 'Kite flying high! 🪁' : 'Gentle whisper'}
                </span>
              </div>

              {/* Clouds */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <CloudSun className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Clouds</span>
                <span className="text-base font-extrabold font-fun text-slate-800 tabular-nums">
                  {current.cloud_cover}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {current.cloud_cover > 70 ? 'Cloud blanket' : 'Sunny patches'}
                </span>
              </div>

              {/* Humidity */}
              <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 text-center">
                <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Air Moisture</span>
                <span className="text-base font-extrabold font-fun text-slate-800 tabular-nums">
                  {current.relative_humidity_2m}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {current.relative_humidity_2m > 70 ? 'Cozy humid' : 'Fresh & crisp'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
