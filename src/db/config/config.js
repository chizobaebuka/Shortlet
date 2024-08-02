require('dotenv').config();

module.exports = {
  "development": {
    "username": "postgres",
    "password": "1234",
    "database": "shortlet_db",
    "host": "localhost",
    "dialect": "postgres"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "postgres",
    "password": "1234",
    "database": "shortlet_db",
    "host": "localhost",
    "dialect": "postgres"
  }
}
