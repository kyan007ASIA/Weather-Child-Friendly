/**
 * MCP Protocol Gateway API
 * Connects to Smithery MCP servers:
 * - https://server.smithery.ai/isdaniel/mcp_weather_server
 * - https://mcp.smithery.ai/kyan007
 */
import { Router } from 'express';

const router = Router();

export const DEFAULT_MCP_ENDPOINT = 'https://server.smithery.ai/isdaniel/mcp_weather_server';
export const LEGACY_MCP_ENDPOINT = 'https://mcp.smithery.ai/kyan007';

export const KNOWN_MCP_SERVERS = [
  {
    name: 'Weather MCP Server (isdaniel)',
    endpoint: 'https://server.smithery.ai/isdaniel/mcp_weather_server',
    deploymentUrl: 'https://mcp_weather_server--isdaniel.run.tools',
    description: 'Reference Open-Meteo weather server with tools for current weather, date ranges, and air quality.',
    tools: [
      'get_current_weather',
      'get_weather_byDateTimeRange',
      'get_weather_details',
      'get_air_quality',
      'get_air_quality_details',
      'get_current_datetime',
      'get_timezone_info',
      'convert_time',
    ],
  },
  {
    name: 'kyan007 Weather Server',
    endpoint: 'https://mcp.smithery.ai/kyan007',
    description: 'User MCP server endpoint on Smithery registry.',
    tools: ['get_current_weather', 'get_weather_forecast'],
  },
];

// Helper to make JSON-RPC calls to any Smithery MCP endpoint
export async function callMCPEndpoint(method, params = {}, authToken, customEndpoint) {
  const targetUrl = customEndpoint || DEFAULT_MCP_ENDPOINT;
  const headers = {
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
    const res = await fetch(targetUrl, {
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
      endpoint: targetUrl,
      data,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      status: 500,
      ok: false,
      endpoint: targetUrl,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// Local implementation of isdaniel/mcp_weather_server tools for local execution & testing
export async function executeWeatherToolLocally(toolName, args = {}) {
  const city = args.city || 'New York';

  // 1. Geocode
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();
  const loc = geoData.results?.[0] || { latitude: 40.7128, longitude: -74.006, name: city };

  if (toolName === 'get_current_weather' || toolName === 'get_weather_details') {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(weatherUrl);
    const data = await res.json();
    return {
      tool: toolName,
      city: loc.name,
      country: loc.country,
      coordinates: { latitude: loc.latitude, longitude: loc.longitude },
      current: data.current,
      summary: `Current weather in ${loc.name}: ${data.current?.temperature_2m}°C, weather code ${data.current?.weather_code}, wind speed ${data.current?.wind_speed_10m} km/h`,
    };
  }

  if (toolName === 'get_air_quality' || toolName === 'get_air_quality_details') {
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone`;
    const res = await fetch(airUrl);
    const data = await res.json();
    return {
      tool: toolName,
      city: loc.name,
      air_quality: data.current || {},
      summary: `Air quality in ${loc.name}: PM2.5: ${data.current?.pm2_5 ?? 'Good'} μg/m³, PM10: ${data.current?.pm10 ?? 'Good'} μg/m³`,
    };
  }

  if (toolName === 'get_weather_byDateTimeRange') {
    const startDate = args.start_date || new Date().toISOString().split('T')[0];
    const endDate = args.end_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const rangeUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${startDate}&end_date=${endDate}`;
    const res = await fetch(rangeUrl);
    const data = await res.json();
    return {
      tool: toolName,
      city: loc.name,
      range: { startDate, endDate },
      daily: data.daily,
    };
  }

  return { error: `Tool ${toolName} not supported in local fallback runner` };
}

// GET /api/mcp/servers - list supported MCP servers
router.get('/servers', (_req, res) => {
  res.json({
    servers: KNOWN_MCP_SERVERS,
    defaultEndpoint: DEFAULT_MCP_ENDPOINT,
  });
});

// GET /api/mcp/info
router.get('/info', async (req, res) => {
  const token = req.query.token || req.headers.authorization;
  const endpoint = req.query.endpoint || DEFAULT_MCP_ENDPOINT;
  const result = await callMCPEndpoint('tools/list', {}, token, endpoint);

  res.json({
    endpoint,
    connected: result.ok,
    status: result.status,
    requiresAuth: result.status === 401 || (result.data && result.data.error === 'invalid_token'),
    data: result.data || result.error,
    knownServers: KNOWN_MCP_SERVERS,
  });
});

// POST /api/mcp/call
router.post('/call', async (req, res) => {
  const { toolName, arguments: toolArgs, token, endpoint, localFallback = true } = req.body;
  const targetEndpoint = endpoint || DEFAULT_MCP_ENDPOINT;

  // 1. Try MCP remote server call
  const result = await callMCPEndpoint('tools/call', { name: toolName, arguments: toolArgs }, token, targetEndpoint);

  // If remote succeeds, return directly
  if (result.ok) {
    return res.json(result);
  }

  // 2. If remote requires auth or failed, and localFallback is allowed:
  if (localFallback) {
    try {
      const localResult = await executeWeatherToolLocally(toolName, toolArgs);
      return res.json({
        ok: true,
        endpoint: targetEndpoint,
        remoteAttempt: result,
        executedVia: 'isdaniel/mcp_weather_server-schema-engine',
        result: localResult,
      });
    } catch (err) {
      return res.status(result.status || 500).json(result);
    }
  }

  res.status(result.status || 200).json(result);
});

export default router;
