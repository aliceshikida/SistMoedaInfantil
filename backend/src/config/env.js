import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  /** URL pública da API (usada no src das imagens de QR em e-mails). */
  apiPublicUrl:
    process.env.API_PUBLIC_URL ||
    `http://localhost:${Number(process.env.PORT || 4000)}`,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "noreply@sme.local",
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || "",
    emailQueue: process.env.RABBITMQ_EMAIL_QUEUE || "sme.email",
  },
};
