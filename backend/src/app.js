import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import router from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { swaggerOptions } from "./config/swagger.js";
import { UPLOADS_DIR } from "./config/paths.js";
import { env } from "./config/env.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin:
      env.nodeEnv === "development"
        ? true
        : env.frontendUrl,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));
app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
