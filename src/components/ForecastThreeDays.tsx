import React from 'react';
import { Calendar, Sun, CloudRain, Cloud, CloudSnow, Flame, Umbrella, Sparkles } from 'lucide-react';
import { DailyWeather } from '../types/weather';
import { interpretWeatherForKids, formatDayName, cToF } from '../utils/weatherInterpreter';

interface ForecastThreeDaysProps {
  daily: DailyWeather;
  tempUnit: 'C' | 'F';
}

export const ForecastThreeDays: React.FC<ForecastThreeDaysProps> = ({ daily, tempUnit }) => {
  // We want the next 3 days: index 1 (tomorrow), index 2, and index 3
  const nextThreeDays = [1, 2, 3].map((index) => {
    const dateStr = daily.time[index];
    const code = daily.weather_code[index];
    const maxTempC = daily.temperature_2m_max[index];
    const minTempC = daily.temperature_2m_min[index];
    const rainProb = daily.precipitation_probability_max[index] ?? 0;
    const uvIndex = daily.uv_index_max[index] ?? 3;
    const windSpeed = daily.wind_speed_10m_max[index] ?? 10;

    const interpretation = interpretWeatherForKids(code, maxTempC, 1, windSpeed, rainProb);
    const dayLabel = formatDayName(dateStr, index);

    const maxTempDisplay = tempUnit === 'F' ? cToF(maxTempC) : Math.round(maxTempC);
    const minTempDisplay = tempUnit === 'F' ? cToF(minTempC) : Math.round(minTempC);

    return {
      index,
      dateStr,
      dayLabel,
      code,
      maxTempDisplay,
      minTempDisplay,
      rainProb,
      uvIndex,
      windSpeed,
      interpretation,
    };
  });

  return (
    <section id="forecast" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-fun text-slate-800">
              Next 3 Days Adventure Weather
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Plan your outdoor games and clothes for the upcoming days!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {nextThreeDays.map((day) => {
          const { interpretation } = day;

          // Pick dynamic card style
          let cardBg = 'bg-amber-50/50 border-amber-200';
          let icon = <Sun className="w-8 h-8 text-amber-500" />;
          let moodBadge = 'bg-amber-100 text-amber-800';

          if (interpretation.mascotType === 'rainy') {
            cardBg = 'bg-blue-50/50 border-blue-200';
            icon = <CloudRain className="w-8 h-8 text-blue-500" />;
            moodBadge = 'bg-blue-100 text-blue-800';
          } else if (interpretation.mascotType === 'snowy') {
            cardBg = 'bg-cyan-50/50 border-cyan-200';
            icon = <CloudSnow className="w-8 h-8 text-cyan-500" />;
            moodBadge = 'bg-cyan-100 text-cyan-800';
          } else if (interpretation.mascotType === 'cloudy') {
            cardBg = 'bg-slate-50 border-slate-200';
            icon = <Cloud className="w-8 h-8 text-slate-500" />;
            moodBadge = 'bg-slate-100 text-slate-700';
          }

          return (
            <div
              key={day.dateStr}
              className={`rounded-2xl p-5 border shadow-xs transition-transform duration-200 hover:-translate-y-1 bg-white ${cardBg} flex flex-col justify-between`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-sm font-bold text-slate-700">{day.dayLabel}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${moodBadge}`}
                  >
                    {interpretation.mascotType.toUpperCase()}
                  </span>
                </div>

                {/* Weather icon + big temperature */}
                <div className="flex items-center gap-4 my-2">
                  <div className="p-3 bg-white rounded-2xl shadow-xs shrink-0">{icon}</div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-fun text-slate-900 tabular-nums">
                        {day.maxTempDisplay}°
                      </span>
                      <span className="text-base font-bold text-slate-400 tabular-nums">
                        / {day.minTempDisplay}°{tempUnit}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 block line-clamp-1">
                      {interpretation.simpleTitle}
                    </span>
                  </div>
                </div>

                {/* Rain probability bar */}
                <div className="my-3 bg-white/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span className="flex items-center gap-1">
                      <Umbrella className="w-3.5 h-3.5 text-blue-500" /> Rain Chance
                    </span>
                    <span className="tabular-nums font-bold text-slate-700">
                      {day.rainProb}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        day.rainProb > 40 ? 'bg-blue-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.max(day.rainProb, 5)}%` }}
                    />
                  </div>
                </div>

                {/* Best Activity Recommendation */}
                <div className="space-y-1.5 mt-3">
                  <div className="text-xs font-medium text-slate-600">
                    <strong className="text-slate-800">Best for:</strong>{' '}
                    {interpretation.playAdvice.slice(0, 60)}...
                  </div>
                </div>
              </div>

              {/* Bottom Clothing suggestion badge */}
              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Wear:</span>
                <span className="font-bold text-slate-700 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-2xs">
                  {interpretation.clothingSuggestions[0]?.icon}{' '}
                  {interpretation.clothingSuggestions[0]?.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
