import "dotenv/config";
import app from "./app";
// import sequelize from './config/db';
// import config from './config/config.js';

const PORT = process.env.PORT || 8080;
// const env = process.env.NODE_ENV || 'development';
// const dbConfig = config[env];

// Connect to the database
// sequelize 
//   .authenticate()
//   .then(() => {
//     console.log('Connected to the database');
//   })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
