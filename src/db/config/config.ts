import * as dotenv from 'dotenv';
dotenv.config();

interface DbConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: string;
  ssl: boolean;
  poolMax: number;
  poolMin: number;
}

interface Config {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
}

const poolMax = Number(process.env.DB_POOL_MAX) || 10;
const poolMin = Number(process.env.DB_POOL_MIN) || 2;
const ssl = process.env.DB_SSL === 'true';

const config: Config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'shortlet_db',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    ssl,
    poolMax,
    poolMin,
  },
  test: {
    username: process.env.DB_USER_TEST || 'root',
    password: process.env.DB_PASSWORD_TEST || '',
    database: process.env.DB_NAME_TEST || 'database_test',
    host: process.env.DB_HOST_TEST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    ssl: false,
    poolMax,
    poolMin,
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'shortlet_db',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    ssl,
    poolMax,
    poolMin,
  },
};

export default config;
