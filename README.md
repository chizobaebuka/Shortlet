# Shortlet

# packages used
npm install axios cors dotenv express pg pg-hstore sequelize
npm install --save-dev @types/cors @types/express @types/node nodemon sequelize-cli ts-node typescript

# to create the country table on the database
npx sequelize-cli migration:generate --name create-countries-table

npm install --save pg pg-hstore
