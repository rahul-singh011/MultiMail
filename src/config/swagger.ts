import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MultiMail API',
        version: '1.0.0',
        description: 'Multi-tenant email marketing platform API with bulk sending, tracking, and real-time progress',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
    },
    apis: ['./src/routes/*.ts'],
  }
  
  export const swaggerSpec = swaggerJsdoc(options)