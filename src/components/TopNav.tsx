import React from 'react';
import { Volume2, VolumeX, Server, Sparkles } from 'lucide-react';

interface TopNavProps {
  tempUnit: 'C' | 'F';
  onToggleUnit: () => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onOpenMcp: () => void;
  mcpConnected: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  tempUnit,
  onToggleUnit,
  isSpeaking,
  onToggleSpeech,
  onOpenMcp,
  mcpConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <a href="#" className="flex items-center gap-2 group shrink-0">
          <span className="text-2xl font-bold font-fun tracking-tight text-sky-600 group-hover:text-amber-500 transition-colors">
            WeatherBuddy
          </span>
          <span className="hidden sm:inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Kids Edition
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a href="#current" className="hover:text-sky-600 transition-colors">
            Today's Sky
          </a>
          <a href="#forecast" className="hover:text-sky-600 transition-colors">
            3-Day Forecast
          </a>
          <a href="#closet" className="hover:text-sky-600 transition-colors">
            Dress Up Helper
          </a>
          <a href="#playmeter" className="hover:text-sky-600 transition-colors">
            Playtime Score
          </a>
        </nav>

        {/* Zone 3: Interactive Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Audio speech button */}
          <button
            onClick={onToggleSpeech}
            title={isSpeaking ? 'Mute weather buddy' : 'Read weather aloud'}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 animate-pulse'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop Voice' : 'Read Aloud'}</span>
          </button>

          {/* Unit Toggle */}
          <button
            onClick={onToggleUnit}
            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-colors cursor-pointer"
            title="Switch between Celsius and Fahrenheit"
          >
            °{tempUnit} Mode
          </button>

          {/* MCP Inspector trigger */}
          <button
            onClick={onOpenMcp}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              mcpConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
            }`}
            title="MCP Endpoint: https://mcp.smithery.ai/kyan007"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">MCP Status</span>
          </button>
        </div>
      </div>
    </header>
  );
};
