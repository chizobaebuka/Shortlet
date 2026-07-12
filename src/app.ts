import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import countryRoutes from './routes/country.route';
import authRoutes from './routes/auth.route';
import healthRoutes from './routes/health.route';
import swaggerUi from 'swagger-ui-express';
import morgan from 'morgan';
import swaggerDocument from './db/swagger-output.json';
import logger from './utils/logger';
import { apiRateLimiter, migrateRateLimiter } from './middleware/rateLimit';

// Create an instance of Express
const app = express();

// Required for correct client IPs (rate limiting, logging) behind a load balancer.
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '1mb' })); // Parse JSON bodies, bounded to avoid oversized payloads
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Liveness/readiness probes are unauthenticated and unthrottled by design.
app.use(healthRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api', apiRateLimiter);
app.use('/api/migrate', migrateRateLimiter);
app.use('/api', countryRoutes);
app.use('/api/auth', authRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
