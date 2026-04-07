import swaggerUi from "swagger-ui-express";
import { orderPaths } from "./paths/order.path.js";
import { orderSchemas } from "./schemas/order.schema.js";
import dotenv from "dotenv";
import { customerPaths } from "./paths/customer.path.js";
import { customerSchemas } from "./schemas/customer.schema.js";
import { productSchemas } from "./schemas/productSchema.js";
import { productPaths } from "./paths/product.path.js";
import { kafkaPaths } from "./paths/kafka.path.js";
dotenv.config();



export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Order API",
    version: "1.0.0",
    description: "API for Order Management System"
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5001}`,
      description: "Local development server  "
    }
  ],
  paths: {
    ...orderPaths,
    ...customerPaths,
    ...productPaths,
    ...kafkaPaths
  },
  components: {
    schemas: {
      ...orderSchemas,
      ...customerSchemas,
      ...productSchemas
    }
  }
};

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};