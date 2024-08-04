import "dotenv/config";
import app from "./app";
import sequelize from './db/sequelize';
import redisClient from "./db/redisClient";

const PORT = process.env.PORT || 8080;

sequelize 
  .authenticate()
  .then(() => {
    console.log('Connected to the database');
  })

redisClient.connect()
  .then(() => {
    console.log('Connected to Redis');
  })
  .catch(err => {
    console.error('Unable to connect to Redis:', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
