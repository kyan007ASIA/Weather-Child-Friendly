/**
 * Weather & Geocoding API
 * Integrates MCP endpoint kyan007 with fallback to live meteorological data.
 */
import { Router } from 'express';
import { callMCPEndpoint } from './mcp.js';

const router = Router();
const MCP_ENDPOINT = 'https://mcp.smithery.ai/kyan007';

// GET /api/weather/geocode
router.get('/geocode', async (req, res) => {
  const query = req.query.q;
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=en&format=json`;
    const resp = await fetch(url);
    const data = await resp.json();
    return res.json(data.results || []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to geocode';
    return res.status(500).json({ error: msg });
  }
});

// GET /api/weather
router.get('/', async (req, res) => {
  const lat = parseFloat(req.query.lat || '40.7128');
  const lon = parseFloat(req.query.lon || '-74.0060');
  const city = req.query.city || 'New York';
  const token = req.query.token || req.headers.authorization;

  // 1. Try MCP endpoint first
  let mcpResult = { ok: false };
  let mcpTools = null;
  try {
    const listRes = await callMCPEndpoint('tools/list', {}, token);
    if (listRes.ok && listRes.data?.result?.tools) {
      mcpTools = listRes.data.result;
      const weatherTool = mcpTools?.tools?.find((t) =>
        t.name.toLowerCase().includes('weather') || t.name.toLowerCase().includes('forecast')
      );
      if (weatherTool) {
        mcpResult = await callMCPEndpoint(
          'tools/call',
          {
            name: weatherTool.name,
            arguments: { latitude: lat, longitude: lon, city },
          },
          token
        );
      }
    } else {
      mcpResult = {
        ok: false,
        status: listRes.status,
        data: listRes.data || listRes.error,
      };
    }
  } catch (err) {
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
  } catch (err) {
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

export default router;
