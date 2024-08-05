import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: '1.0.0',
    title: 'Shortlet API',
    description: 'Shortlet API Documentation'
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Local server'
    }
  ],
  tags: [
    {
      name: 'User',
      description: 'Operations related to users'
    },
    {
      name: 'Country',
      description: 'Operations related to countries'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const outputFile = './src/db/swagger-output.json'; // Ensure this path is correct
const routes = ['./dist/routes/auth.route.js', './dist/routes/country.route.js']; // Ensure this path is correct

(async () => {
  try {
    console.log('Generating Swagger documentation...');
    await swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
    console.log('Swagger documentation generated successfully!');
  } catch (error) {
    console.error('Error generating Swagger documentation:', error);
  }
})();
