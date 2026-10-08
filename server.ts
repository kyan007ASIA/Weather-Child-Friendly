import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const MCP_ENDPOINT = 'https://mcp.smithery.ai/kyan007';

interface MCPToolResponse {
  tools?: Array<{
    name: string;
    description?: string;
    inputSchema?: Record<string, unknown>;
  }>;
}

// Helper to make JSON-RPC calls to Smithery MCP
async function callMCPEndpoint(
  method: string,
  params: Record<string, unknown> = {},
  authToken?: string
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = authToken || process.env.SMITHERY_API_KEY || process.env.SMITHERY_TOKEN;
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);
    return {
      status: res.status,
      ok: res.ok,
      data,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: 500,
      ok: false,
      error: message,
    };
  }
}

// MCP Diagnostic / Info route
app.get('/api/mcp/info', async (req: Request, res: Response) => {
  const token = (req.query.token as string) || (req.headers.authorization as string);
  const result = await callMCPEndpoint('tools/list', {}, token);

  res.json({
    endpoint: MCP_ENDPOINT,
    connected: result.ok,
    status: result.status,
    requiresAuth: result.status === 401 || (result.data && result.data.error === 'unauthorized'),
    data: result.data || result.error,
  });
});

// Direct MCP Call bridge
app.post('/api/mcp/call', async (req: Request, res: Response) => {
  const { toolName, arguments: toolArgs, token } = req.body;
  const result = await callMCPEndpoint('tools/call', { name: toolName, arguments: toolArgs }, token);
  res.status(result.status || 200).json(result);
});

// Geocoding helper for city search
app.get('/api/weather/geocode', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=en&format=json`;
    const resp = await fetch(url);
    const data = await resp.json();
    return res.json(data.results || []);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to geocode';
    return res.status(500).json({ error: msg });
  }
});

// Primary Weather API: Integrates MCP endpoint with seamless Live fallback
app.get('/api/weather', async (req: Request, res: Response) => {
  const lat = parseFloat((req.query.lat as string) || '40.7128');
  const lon = parseFloat((req.query.lon as string) || '-74.0060');
  const city = (req.query.city as string) || 'New York';
  const token = (req.query.token as string) || (req.headers.authorization as string);

  // 1. Try MCP endpoint first
  let mcpResult: { ok: boolean; status?: number; data?: any; error?: string } = { ok: false };
  let mcpTools: MCPToolResponse | null = null;
  try {
    const listRes = await callMCPEndpoint('tools/list', {}, token);
    if (listRes.ok && listRes.data?.result?.tools) {
      mcpTools = listRes.data.result;
      // If we find a weather tool, invoke it
      const weatherTool = mcpTools?.tools?.find((t) =>
        t.name.toLowerCase().includes('weather') || t.name.toLowerCase().includes('forecast')
      );
      if (weatherTool) {
        mcpResult = await callMCPEndpoint('tools/call', {
          name: weatherTool.name,
          arguments: { latitude: lat, longitude: lon, city },
        }, token);
      }
    } else {
      mcpResult = {
        ok: false,
        status: listRes.status,
        data: listRes.data || listRes.error,
      };
    }
  } catch (err: unknown) {
    mcpResult = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  // 2. Fetch live data from Open-Meteo for rich current & 3-day forecast
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=4`;

    const weatherResp = await fetch(weatherUrl);
    if (!weatherResp.ok) {
      throw new Error(`Open-Meteo responded with status ${weatherResp.status}`);
    }
    const rawWeather = await weatherResp.json();

    return res.json({
      location: {
        city,
        latitude: lat,
        longitude: lon,
        timezone: rawWeather.timezone,
      },
      current: rawWeather.current,
      daily: rawWeather.daily,
      hourly: rawWeather.hourly,
      mcpDiagnostics: {
        endpoint: MCP_ENDPOINT,
        attempted: true,
        mcpOk: mcpResult.ok,
        mcpStatus: mcpResult.status,
        mcpData: mcpResult.data,
        toolsFound: mcpTools?.tools?.map((t) => t.name) || [],
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Weather fetch failure';
    return res.status(500).json({
      error: msg,
      mcpDiagnostics: {
        endpoint: MCP_ENDPOINT,
        attempted: true,
        mcpOk: mcpResult.ok,
        mcpData: mcpResult.data,
      },
    });
  }
});

// Setup Vite middleware in dev or static serve in prod
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WeatherBuddy server ready on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
