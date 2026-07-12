import express, { Request, Response } from 'express';
import sequelize from '../db/sequelize';
import redisClient from '../db/redisClient';

const router = express.Router();

// Liveness: process is up and serving requests.
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Readiness: dependencies the app actually needs to serve traffic are reachable.
// Used by load balancers/orchestrators to decide whether to route to this instance.
router.get('/ready', async (req: Request, res: Response) => {
  const checks = { database: false, redis: redisClient.isOpen };

  try {
    await sequelize.authenticate();
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const isReady = checks.database && checks.redis;
  res.status(isReady ? 200 : 503).json({ status: isReady ? 'ready' : 'not ready', checks });
});

export default router;
