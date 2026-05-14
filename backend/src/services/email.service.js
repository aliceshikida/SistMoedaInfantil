import nodemailer from "nodemailer";
import QRCode from "qrcode";
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

export async function sendMail({ to, subject, title, body, linkQrCode }) {
  if (!env.smtp.host || !to) return;
  
  let finalBody = body;

  if (linkQrCode) {
    try {
      const qrCodeImageBase64 = await QRCode.toDataURL(linkQrCode);
      finalBody += `
        <div style="margin-top: 24px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #475569; font-size: 14px; margin-bottom: 12px;"><strong>Acesse pelo celular:</strong> Escaneie o QR Code abaixo</p>
          <img src="${qrCodeImageBase64}" alt="QR Code" style="width: 150px; height: 150px; border-radius: 8px; border: 1px solid #e2e8f0; padding: 4px; background: #fff;" />
        </div>
      `;
    } catch (err) {
      console.warn("Falha ao gerar QR Code para o email:", err.message);
    }
  }

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html: htmlTemplate(title, finalBody),
    });
  } catch (error) {
    console.warn("Email não enviado no ambiente local:", error.message);
  }
}
