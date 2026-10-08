/**
 * Health check monitor API
 * Checks system uptime, API responsiveness, MCP endpoint status, and external weather provider availability.
 */
import { Router } from 'express';

const router = Router();
const MCP_ENDPOINT = 'https://mcp.smithery.ai/kyan007';

export async function checkSystemHealth(smitheryToken) {
  const startTime = Date.now();

  // Check 1: MCP endpoint reachability
  let mcpCheck = {
    endpoint: MCP_ENDPOINT,
    reachable: false,
    status: null,
    latencyMs: 0,
    message: '',
  };

  const mcpStart = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const headers = { 'Content-Type': 'application/json' };
    const token = smitheryToken || process.env.SMITHERY_API_KEY || process.env.SMITHERY_TOKEN;
    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    const res = await fetch(MCP_ENDPOINT, {
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

    mcpCheck.status = res.status;
    mcpCheck.latencyMs = Date.now() - mcpStart;
    mcpCheck.reachable = true;
    mcpCheck.message = res.ok ? 'MCP server responding normally' : `Responded with HTTP ${res.status}`;
  } catch (err) {
    mcpCheck.latencyMs = Date.now() - mcpStart;
    mcpCheck.message = err instanceof Error ? err.message : String(err);
  }

  // Check 2: Meteorological Satellite Engine (Open-Meteo) reachability
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

    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m', {
      signal: controller.signal,
    });
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
      mcpEndpoint: mcpCheck,
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
