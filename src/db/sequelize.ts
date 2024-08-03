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
        dialect: dbConfig.dialect as Dialect,
    }
);

export default sequelize;
