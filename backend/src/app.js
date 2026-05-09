import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { swaggerOptions } from "./config/swagger.js";
import { env } from "./config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));
app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
