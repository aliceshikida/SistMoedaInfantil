export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sistema de Moeda Estudantil API",
      version: "1.0.0",
      description: "API REST com autenticação JWT e regras de moedas estudantis.",
    },
    servers: [{ url: "http://localhost:4000/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [],
};
