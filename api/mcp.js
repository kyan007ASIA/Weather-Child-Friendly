/**
 * MCP Protocol Gateway API
 * Connects to the Smithery MCP server at https://mcp.smithery.ai/kyan007
 */
import { Router } from 'express';

const router = Router();
const MCP_ENDPOINT = 'https://mcp.smithery.ai/kyan007';

export async function callMCPEndpoint(method, params = {}, authToken) {
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
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      status: 500,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// GET /api/mcp/info
router.get('/info', async (req, res) => {
  const token = req.query.token || req.headers.authorization;
  const result = await callMCPEndpoint('tools/list', {}, token);

  res.json({
    endpoint: MCP_ENDPOINT,
    connected: result.ok,
    status: result.status,
    requiresAuth: result.status === 401 || (result.data && result.data.error === 'unauthorized'),
    data: result.data || result.error,
  });
});

// POST /api/mcp/call
router.post('/call', async (req, res) => {
  const { toolName, arguments: toolArgs, token } = req.body;
  const result = await callMCPEndpoint('tools/call', { name: toolName, arguments: toolArgs }, token);
  res.status(result.status || 200).json(result);
});

export default router;
