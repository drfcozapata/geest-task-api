import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Geest Task API',
      version: '1.0.0',
      description: 'API de gestión de tareas para empresas',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: '/',
        description: 'API raíz (paths del reto)',
      },
      {
        url: '/api/v1',
        description: 'API v1 (prefijo alternativo)',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            name: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Complete project documentation',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Write comprehensive documentation',
            },
            status: {
              type: 'string',
              enum: ['open', 'archived'],
              example: 'open',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        TaskAssignment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
            },
            taskId: {
              type: 'integer',
            },
            userId: {
              type: 'integer',
            },
            completed: {
              type: 'boolean',
            },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            attempt: {
              type: 'integer',
              example: 1,
            },
            httpStatus: {
              type: 'integer',
              nullable: true,
              example: 200,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            payload: {
              type: 'object',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'USER_NOT_FOUND',
                },
                message: {
                  type: 'string',
                  example: 'User with id 5 does not exist',
                },
              },
            },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'lastName', 'email'],
          properties: {
            name: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
          },
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              example: 'Complete project documentation',
            },
            description: {
              type: 'string',
              example: 'Write comprehensive documentation',
            },
          },
        },
        AssignTaskRequest: {
          type: 'object',
          required: ['userIds'],
          properties: {
            userIds: {
              type: 'array',
              items: {
                type: 'integer',
              },
              example: [1, 2, 3],
            },
          },
        },
        CompleteTaskRequest: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: {
              type: 'integer',
              example: 1,
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
