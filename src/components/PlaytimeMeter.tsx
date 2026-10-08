import React from 'react';
import { Compass, Lightbulb, Check, AlertCircle } from 'lucide-react';
import { KidWeatherInterpretation } from '../types/weather';

interface PlaytimeMeterProps {
  interpretation: KidWeatherInterpretation;
}

export const PlaytimeMeter: React.FC<PlaytimeMeterProps> = ({ interpretation }) => {
  const score = interpretation.playScore;

  let scoreColor = 'text-emerald-600';
  let barColor = 'bg-emerald-500';
  let verdict = 'Awesome Playtime Outside!';
  if (score < 40) {
    scoreColor = 'text-rose-600';
    barColor = 'bg-rose-500';
    verdict = 'Cozy Indoor Fun Day!';
  } else if (score < 75) {
    scoreColor = 'text-amber-600';
    barColor = 'bg-amber-500';
    verdict = 'Good for Quick Outdoor Adventures!';
  }

  return (
    <section id="playmeter" className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
      {/* Playtime Score card */}
      <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold font-fun text-slate-800">
              Can We Play Outside?
            </h3>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-bold text-slate-600">Outdoor Adventure Rating</span>
            <span className={`text-2xl font-extrabold font-fun ${scoreColor} tabular-nums`}>
              {score} / 100
            </span>
          </div>

          {/* Meter progress bar */}
          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 mb-3 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-800 block mb-1">
              {verdict}
            </span>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {interpretation.playAdvice}
            </p>
          </div>
        </div>

        {/* Quick activity checklist */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{score >= 70 ? 'Playground & Swings' : 'Indoor LEGO Castle'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{score >= 70 ? 'Bicycle & Scooter' : 'Coloring & Drawing'}</span>
          </div>
        </div>
      </div>

      {/* Science Fun Fact Card */}
      <div className="md:col-span-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 sm:p-7 border border-amber-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200 flex items-center justify-center text-amber-800">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold font-fun text-amber-950">
              Weather Science Wonder!
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-amber-900 font-semibold leading-relaxed mb-4">
            "{interpretation.scienceFunFact}"
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-amber-200/60 text-[11px] text-amber-800 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Ask a grown-up or teacher about why clouds float!</span>
        </div>
      </div>
    </section>
  );
};
