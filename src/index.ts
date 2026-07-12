import { env } from "./config/env";
import app from "./app";
import sequelize from './db/sequelize';
import redisClient from "./db/redisClient";
import logger from "./utils/logger";

const PORT = env.PORT;

sequelize
  .authenticate()
  .then(() => {
    logger.info('Connected to the database');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database', { error: err.message });
  });

redisClient.connect()
  .then(() => {
    logger.info('Connected to Redis');
  })
  .catch((err) => {
    logger.error('Unable to connect to Redis', { error: err.message });
  });

const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    try {
      await sequelize.close();
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
      clearTimeout(forceExit);
      logger.info('Shutdown complete');
      process.exit(0);
    } catch (err: any) {
      logger.error('Error during shutdown', { error: err.message });
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
