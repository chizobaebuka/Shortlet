# Shortlet

## PACKAGES USED
npm install axios cors dotenv express pg pg-hstore sequelize jsonwebtoken bcrypt swagger-jsdoc swagger-ui-express redis
npm install --save-dev @types/cors @types/express @types/node nodemon sequelize-cli ts-node typescript @types/jsonwebtoken @types/redis

## DATABASE SETUP
1. Generate migrations for creating tables 
npx sequelize-cli migration:generate --name create-countries-table
npx sequelize-cli migration:generate --name create-users-table

2. Run database migrations:
npx sequelize-cli db:migrate

## OVERVIEW OF THE IMPLEMENTATION APPROACH

The implementation of the Shortlet project involves building a REST API using TypeScript with Node.js and Express. The API integrates data from the REST Countries API, processes it, and exposes it through various endpoints. Here’s a detailed overview of the approach taken:

PROJECT STRUCTURE
Source Code Organization:
src: Contains TypeScript source files, including controllers, services, and models.
db: Houses database-related files such as migrations, seeders, and model definitions.
config: Holds configuration files for database connections and other environment-specific settings.
Separation of Concerns:
Controllers: Handle incoming requests, process data, and send responses.
Services: Contain business logic and interact with repositories to fetch and manipulate data.

DATA INTEGRATION
Fetching Data: Data is retrieved from the REST Countries API using Axios, a promise-based HTTP client.
Data Processing: The fetched data is processed and transformed into a format suitable for storage and API responses.
Data Storage: Data is stored in a PostgreSQL database using Sequelize, allowing for efficient querying and management.

SECURITY
User Authentication: Implemented using JWT for secure access to protected routes.
Data Validation: Ensured using Zod to validate incoming data and prevent potential security issues.

API ENDPOINTS
Design: Endpoints are designed to provide detailed and aggregated information about countries, regions, and languages.
Pagination and Filtering: Implemented to handle large datasets efficiently and allow users to filter data based on region or population size.
Detailed Endpoints: Provide comprehensive information about specific countries, including languages, population, and bordering countries.

DEPLOYMENT AND CONFIGURATION
Environment Configuration: Managed through .env files, with different settings for development and production environments.
Build and Run Scripts: Defined npm scripts to handle building, migrating, and seeding the database, as well as running the server.
This approach ensures a well-structured, secure, and performant REST API that efficiently handles and serves country data while providing a clear and maintainable codebase.

BASE_URL: The base URL for the application (default is `http://localhost:8080`).

STEPS TAKEN TO START THE PROJECT
1. Create the Country Table Model
2. Create a database on postgres called shortlet_db to store the country table 
3. After creating the table on the database, to migrate the table to the database
4. create a migration file to the effect by running the commands below for both Users and Country Table and this would create the migration file then you comfigure the migration file with your table information 
npx sequelize-cli migration:generate --name create-countries-table
npx sequelize-cli migration:generate --name create-users-table
5. After step 4, run the command below to migrate the table to the database
### run npx sequelize-cli db:migrate 
6. You would need to hit the api to (migrateDatatoDB) BASE_URL/api/migrate 
7. Perform the other operations as seen **ENDPOINTS** to get the desired results 
8. Refer to the documentation at http://localhost:8080/api-docs 


STEPS TO RUN THE PROJECT  
1. Clone the repo
2. install dependencies
    npm install
3. Using the .env.sample you would see a copy of the env, configure yours alike 
4. Build the project  
    npm run build / npx tsc
5. Start the server in dev mode  
    npm run dev

ENDPOINTS: 
1. GET All Countries: GET BASE_URL/api/countries
    Retrieve all countries paginated and with filters
2. GET Country By Code: GET BASE_URL/api/countries/:{code}
    Retrieve detailed information for a specific country, including its languages, population, area, and bordering countries
3. GET Regions: BASE_URL/api/regions
    Retrieve a list of regions and the countries within each region, with additional aggregated data such as the total population of the region.
4. GET Languages: BASE_URL/api/languages
    Retrieve a list of languages and the countries where they are spoken. Include the total number of speakers globally for each language.
5. GET Statistics: BASE_URL/api/statistics
    Provide aggregated statistics such as the total number of countries, the largest country by area, the smallest by population, and the most widely spoken language.
4. POST Create User: POST BASE_URL/api/auth/create
    Create a User in the db for security of the api 
5. POST Login User: POST BASE_URL/api/auth/login
    Login the user and then access the secured apis with the logged in user


CHALLENGES & SOLUTIONS
Initial Issues with Null Values on the migrated data:
Problem: During the initial data migration, several fields in the database contained null values. This issue stemmed from incorrect mapping between the properties defined in the Sequelize model and the fields present in the REST Countries API response.

Solution: To address this, I conducted a detailed review of the API response structure and compared it with the database schema. This involved updating the mapping logic to ensure that all properties were accurately referenced and assigned. Implemented additional checks and logging to identify and resolve any discrepancies between the data received and the data stored.


USING REDIS FOR DATA CACHING
1. start redis if already installed  - brew services start redis
2. if redis is not installed - brew install redis
3. create the testRedis file to test the redis connection 
    npx ts-node testRedis
4. create the redisClient file and run 
    redis-server
5. implemented caching strategy across service layer for optimizing performance 

IMPLEMENTING LOGGING
1. install npm install winston morgan
2. create the logger file and configure the logger
3. implemented logging across the service layer for debugging and monitoring purposes