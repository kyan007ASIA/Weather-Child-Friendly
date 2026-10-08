/**
 * Central API router exporting all service endpoints
 */
import { Router } from 'express';
import healthRouter from './health.js';
import weatherRouter from './weather.js';
import mcpRouter from './mcp.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/weather', weatherRouter);
router.use('/mcp', mcpRouter);

export default router;
