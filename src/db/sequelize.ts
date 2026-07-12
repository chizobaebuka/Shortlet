import { Dialect, Sequelize } from 'sequelize';
import config from './config/config';

type Environment = 'development' | 'test' | 'production';

const env: Environment = (process.env.NODE_ENV as Environment) || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect as Dialect,
        logging: env === 'production' ? false : console.log,
        pool: {
            max: dbConfig.poolMax,
            min: dbConfig.poolMin,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: dbConfig.ssl
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : undefined,
    }
);

export default sequelize;
