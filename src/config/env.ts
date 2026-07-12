import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('8080'),

  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.string().default('5432'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_SSL: z.string().optional(),
  DB_POOL_MAX: z.string().default('10'),
  DB_POOL_MIN: z.string().default('2'),

  JWT_SECRET_KEY: z.string().min(1, 'JWT_SECRET_KEY is required'),
  JWT_EXPIRES_IN: z.string().min(1, 'JWT_EXPIRES_IN is required'),

  API_URL: z.string().url('API_URL must be a valid URL'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  LOG_LEVEL: z.string().default('info'),
});

// Fail fast on boot rather than deep inside a request handler.
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
