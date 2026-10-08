/**
 * Health check monitor API
 * Checks system uptime, API responsiveness, MCP endpoints status (isdaniel & kyan007), and weather engine.
 */
import { Router } from 'express';
import { DEFAULT_MCP_ENDPOINT, LEGACY_MCP_ENDPOINT } from './mcp.js';

const router = Router();

export async function checkSystemHealth(smitheryToken) {
  const startTime = Date.now();

  // Helper to ping an MCP endpoint
  async function pingMcp(endpointUrl) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const headers = { 'Content-Type': 'application/json' };
      const token = smitheryToken || process.env.SMITHERY_API_KEY || process.env.SMITHERY_TOKEN;
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }

      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/list',
          params: {},
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      return {
        endpoint: endpointUrl,
        reachable: true,
        status: res.status,
        latencyMs: Date.now() - start,
        message: res.ok
          ? 'MCP server active and authorized'
          : res.status === 401
          ? 'Endpoint reachable (Requires Bearer Auth Token)'
          : `Responded with HTTP ${res.status}`,
      };
    } catch (err) {
      return {
        endpoint: endpointUrl,
        reachable: false,
        status: null,
        latencyMs: Date.now() - start,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Check 1: isdaniel/mcp_weather_server
  const isdanielCheck = await pingMcp(DEFAULT_MCP_ENDPOINT);

  // Check 2: kyan007
  const kyanCheck = await pingMcp(LEGACY_MCP_ENDPOINT);

  // Check 3: Meteorological Satellite Engine (Open-Meteo) reachability
  let weatherEngineCheck = {
    provider: 'Open-Meteo',
    reachable: false,
    latencyMs: 0,
    message: '',
  };

  const weatherStart = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m',
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    weatherEngineCheck.latencyMs = Date.now() - weatherStart;
    weatherEngineCheck.reachable = res.ok;
    weatherEngineCheck.message = res.ok ? 'Weather data feed operational' : `HTTP ${res.status}`;
  } catch (err) {
    weatherEngineCheck.latencyMs = Date.now() - weatherStart;
    weatherEngineCheck.message = err instanceof Error ? err.message : String(err);
  }

  const overallStatus = weatherEngineCheck.reachable ? 'healthy' : 'degraded';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    totalCheckDurationMs: Date.now() - startTime,
    memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    services: {
      apiServer: {
        status: 'up',
        environment: process.env.NODE_ENV || 'development',
      },
      mcpServers: {
        isdanielWeatherServer: isdanielCheck,
        kyanWeatherServer: kyanCheck,
      },
      weatherEngine: weatherEngineCheck,
    },
  };
}

// GET /api/health
router.get('/', async (req, res) => {
  const token = req.query.token || req.headers.authorization;
  const healthData = await checkSystemHealth(token);
  const httpCode = healthData.status === 'healthy' ? 200 : 503;
  res.status(httpCode).json(healthData);
});

export default router;
