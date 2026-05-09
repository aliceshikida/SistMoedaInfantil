import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
});

function htmlTemplate(title, body) {
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f8fafc">
  <h2 style="color:#1e293b">${title}</h2>
  <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e2e8f0">${body}</div>
  <p style="font-size:12px;color:#64748b">Sistema de Moeda Estudantil</p>
</div>`;
}

export async function sendMail({ to, subject, title, body }) {
  if (!env.smtp.host || !to) return;
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html: htmlTemplate(title, body),
    });
  } catch (error) {
    console.warn("Email não enviado no ambiente local:", error.message);
  }
}
