import "dotenv/config";
import app from "./app";
import sequelize from './db/sequelize';

const PORT = process.env.PORT || 8080;

sequelize 
  .authenticate()
  .then(() => {
    console.log('Connected to the database');
  })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
