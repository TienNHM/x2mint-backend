const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.0'});

const doc = {
  openapi: '3.0.0',
  info: {
    version: '3.0.0',
    title: 'X2Mint API',
    description: 'x2mint-api'
  },
  host: 'localhost:5005',
  components: {
      securitySchemes:{
          bearerAuth: {
              type: 'http',
              scheme: 'bearer'
          }
      }
  },
  security: [{ Bearer: [] }],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
    },
  },
};

const outputFile = './swagger-output.json';
const routes = ['./index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);