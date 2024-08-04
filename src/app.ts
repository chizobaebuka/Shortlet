import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import countryRoutes from './routes/countryRoute';
import authRoutes from './routes/authRoute'

// Create an instance of Express
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api', countryRoutes);
app.use('/api/auth', authRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
