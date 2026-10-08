import React, { useState } from 'react';
import { X, Server, RefreshCw, Key, CheckCircle, AlertTriangle, ExternalLink, Code } from 'lucide-react';

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

export const McpInspectorModal: React.FC<McpInspectorModalProps> = ({
  isOpen,
  onClose,
  mcpDiagnostics,
  smitheryToken,
  onSaveToken,
  onRefreshWeather,
}) => {
  const [tokenInput, setTokenInput] = useState(smitheryToken);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<unknown>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveToken(tokenInput.trim());
    onRefreshWeather();
  };

  const handleTestDirect = async () => {
    setIsTesting(true);
    try {
      const res = await fetch(`/api/mcp/info?token=${encodeURIComponent(tokenInput.trim())}`);
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
                MCP Server Connection Inspector
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Endpoint: https://mcp.smithery.ai/kyan007
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

        {/* Status banner */}
        <div className="my-5">
          {mcpDiagnostics?.mcpOk ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-bold text-emerald-900 block">
                  MCP Server Connected!
                </span>
                <p className="text-xs text-emerald-700 mt-0.5">
                  The application is communicating directly with the Smithery MCP server kyan007.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-bold text-amber-900 block">
                  Live Engine Active (MCP Standby / Auth Protected)
                </span>
                <p className="text-xs text-amber-800 mt-1">
                  Smithery MCP endpoints protect their endpoints using Bearer authorization.
                  The app automatically queries <code className="bg-amber-100 px-1 rounded text-amber-900">https://mcp.smithery.ai/kyan007</code> and seamlessly provides live Open-Meteo weather data so the weather monitor is 100% operational.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Token Configuration */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
            <Key className="w-4 h-4 text-slate-500" />
            <span>Smithery API Token / Bearer Key (Optional)</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            If you have an active Smithery account key for kyan007, enter it below to send authenticated JSON-RPC requests.
          </p>
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

        {/* Diagnostics / Raw Payload Viewer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-slate-500" /> MCP Request & Diagnostic Data
            </span>
            <button
              onClick={handleTestDirect}
              disabled={isTesting}
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Ping MCP Endpoint</span>
            </button>
          </div>

          <pre className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
            {JSON.stringify(
              testResult || mcpDiagnostics || { message: 'No diagnostic data yet' },
              null,
              2
            )}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Target: Model Context Protocol (MCP)</span>
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
