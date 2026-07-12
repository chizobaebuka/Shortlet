import rateLimit from 'express-rate-limit';

// General ceiling for all API traffic.
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// /migrate triggers a full external-API pull + DB bulk upsert and has no
// auth in front of it, so it gets a much stricter limit of its own.
export const migrateRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Migration was triggered too recently, please try again later.' },
});
