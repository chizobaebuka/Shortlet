import axios from 'axios';

const API_URL = 'https://restcountries.com/v3.1/all'; // Base URL for REST Countries API

const fetchAllCountries = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching data from REST Countries API');
  }
};

export default { fetchAllCountries };

// import { Sequelize } from 'sequelize';
// import dotenv from 'dotenv';

// dotenv.config();

// const sequelize = new Sequelize ({
//     database: process.env.DB_NAME,
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     host: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT),
//     dialect: 'postgres',
// })

// export default sequelize;

// require('dotenv').config();

// module.exports = {
//   "development": {
//     "username": process.env.DB_USER,
//     "password": process.env.DB_PASS,
//     "database": process.env.DB_NAME,
//     "host": process.env.DB_HOST,
//     "dialect": "postgres"
//   },
//   "test": {
//     "username": "root",
//     "password": null,
//     "database": "database_test",
//     "host": "127.0.0.1",
//     "dialect": "postgres"
//   },
//   "production": {
//     "username": process.env.DB_USER,
//     "password": process.env.DB_PASS,
//     "database": process.env.DB_NAME,
//     "host": process.env.DB_HOST,
//     "dialect": "postgres"
//   }
// }

