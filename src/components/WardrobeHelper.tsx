import React, { useState } from 'react';
import { Shirt, CheckCircle, Sparkles } from 'lucide-react';
import { KidWeatherInterpretation } from '../types/weather';

interface WardrobeHelperProps {
  interpretation: KidWeatherInterpretation;
}

export const WardrobeHelper: React.FC<WardrobeHelperProps> = ({ interpretation }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (name: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const totalMustHaves = interpretation.clothingSuggestions.filter(
    (c) => c.importance === 'must-have'
  ).length;

  const completedMustHaves = interpretation.clothingSuggestions.filter(
    (c) => c.importance === 'must-have' && checkedItems[c.name]
  ).length;

  const isReady = completedMustHaves >= totalMustHaves && totalMustHaves > 0;

  return (
    <section id="closet" className="bg-white rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-sm mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-fun text-slate-800">
              What Should I Wear Today?
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tap each item when you've put it on to get ready!
            </p>
          </div>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shrink-0">
          <div className="text-xs">
            <span className="font-bold text-slate-700">Ready Status:</span>{' '}
            <span className={isReady ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-bold'}>
              {completedMustHaves} / {totalMustHaves} items
            </span>
          </div>
          {isReady && (
            <span className="flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-600" /> All Set!
            </span>
          )}
        </div>
      </div>

      {/* Grid of Clothing Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {interpretation.clothingSuggestions.map((item) => {
          const isChecked = !!checkedItems[item.name];

          return (
            <button
              key={item.name}
              onClick={() => toggleCheck(item.name)}
              className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[130px] relative ${
                isChecked
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200'
                  : 'bg-slate-50/60 hover:bg-sky-50 border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className="absolute top-2 right-2">
                <CheckCircle
                  className={`w-4 h-4 transition-colors ${
                    isChecked ? 'text-emerald-500 fill-emerald-100' : 'text-slate-300'
                  }`}
                />
              </div>

              <div className="text-4xl my-2 transform transition-transform hover:scale-110">
                {item.icon}
              </div>

              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block line-clamp-1">
                  {item.name}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {item.importance === 'must-have' ? 'Essential' : 'Recommended'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
