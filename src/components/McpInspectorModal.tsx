import React, { useState } from 'react';
import {
  X,
  Server,
  RefreshCw,
  Key,
  CheckCircle,
  AlertTriangle,
  Code,
  Activity,
  Play,
  Layers,
} from 'lucide-react';

interface McpInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcpDiagnostics?: {
    endpoint: string;
    attempted: boolean;
    mcpOk: boolean;
    mcpStatus?: number;
    mcpData?: unknown;
    toolsFound?: string[];
  };
  smitheryToken: string;
  onSaveToken: (token: string) => void;
  onRefreshWeather: () => void;
}

const AVAILABLE_SERVERS = [
  {
    name: 'Weather MCP Server (isdaniel)',
    url: 'https://server.smithery.ai/isdaniel/mcp_weather_server',
    badge: 'Recommended Resource',
  },
  {
    name: 'kyan007 Weather Server',
    url: 'https://mcp.smithery.ai/kyan007',
    badge: 'Primary Prompt Endpoint',
  },
];

export const McpInspectorModal: React.FC<McpInspectorModalProps> = ({
  isOpen,
  onClose,
  mcpDiagnostics,
  smitheryToken,
  onSaveToken,
  onRefreshWeather,
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(
    'https://server.smithery.ai/isdaniel/mcp_weather_server'
  );
  const [tokenInput, setTokenInput] = useState(smitheryToken);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'tools' | 'health'>('diagnostics');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveToken(tokenInput.trim());
    onRefreshWeather();
  };

  const handleTestDirect = async () => {
    setIsTesting(true);
    try {
      const res = await fetch(
        `/api/mcp/info?endpoint=${encodeURIComponent(
          selectedEndpoint
        )}&token=${encodeURIComponent(tokenInput.trim())}`
      );
      const data = await res.json();
      setTestResult(data);
    } catch (err: unknown) {
      setTestResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsTesting(false);
    }
  };

  const handleExecuteTool = async (toolName: string, args: Record<string, unknown>) => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/mcp/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: selectedEndpoint,
          toolName,
          arguments: args,
          token: tokenInput.trim(),
          localFallback: true,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: unknown) {
      setTestResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCheckHealth = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setTestResult(data);
    } catch (err: unknown) {
      setTestResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-fun text-slate-800">
                MCP Server Connection & Tools Inspector
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Smithery Model Context Protocol (JSON-RPC 2.0)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Endpoint Selector */}
        <div className="my-4">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Active MCP Resource Endpoint:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_SERVERS.map((server) => {
              const isSelected = selectedEndpoint === server.url;
              return (
                <button
                  key={server.url}
                  onClick={() => {
                    setSelectedEndpoint(server.url);
                    setTestResult(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{server.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      {server.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 truncate block">
                    {server.url}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status banner */}
        <div className="mb-4">
          {mcpDiagnostics?.mcpOk ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  MCP Server Connected!
                </span>
                <p className="text-xs text-emerald-700 mt-0.5">
                  The application is communicating directly with the Smithery MCP server.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  Live Meteorological Engine Active (MCP Standby)
                </span>
                <p className="text-xs text-amber-800 mt-0.5">
                  Smithery MCP endpoints protect tools with OAuth/Bearer authorization.
                  The app automatically queries the MCP endpoint and uses the Open-Meteo engine schema so your monitor is 100% operational.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Testing Actions / Tabs */}
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
          <button
            onClick={() => {
              setActiveTab('diagnostics');
              handleTestDirect();
            }}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-100 hover:bg-sky-200 text-sky-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Ping Server (tools/list)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tools');
              handleExecuteTool('get_current_weather', { city: 'New York' });
            }}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run get_current_weather</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('tools');
              handleExecuteTool('get_air_quality', { city: 'New York' });
            }}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 hover:bg-purple-200 text-purple-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Run get_air_quality</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('health');
              handleCheckHealth();
            }}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>/api/health</span>
          </button>
        </div>

        {/* Token Configuration */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 mb-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5">
            <Key className="w-4 h-4 text-slate-500" />
            <span>Smithery API Token / Bearer Key (Optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste Bearer token here..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Save & Apply
            </button>
          </div>
        </div>

        {/* Output Console */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-slate-500" /> JSON-RPC Response Console
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {isTesting ? 'Fetching...' : 'Ready'}
            </span>
          </div>

          <pre className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-52 border border-slate-800">
            {JSON.stringify(
              testResult || mcpDiagnostics || { message: 'Click any button above to test endpoints or tools.' },
              null,
              2
            )}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Target: isdaniel/mcp_weather_server & kyan007</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
