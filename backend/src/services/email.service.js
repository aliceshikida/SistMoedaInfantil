import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { env } from "../config/env.js";

const smtpPort = env.smtp.port;
const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: env.smtp.user && env.smtp.pass ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
  ...(env.smtp.host?.includes("gmail.com")
    ? { tls: { rejectUnauthorized: true } }
    : {}),
});

function htmlTemplate(title, body) {
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f8fafc">
  <h2 style="color:#1e293b">${title}</h2>
  <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e2e8f0">${body}</div>
  <p style="font-size:12px;color:#64748b">Sistema de Moeda Estudantil</p>
</div>`;
}

async function deliverMail({ to, subject, title, body, attachments, throwOnError }) {
  if (!env.smtp.host || !to) {
    console.warn("Email ignorado: SMTP_HOST ou destinatário ausente.");
    return;
  }
  if (!env.smtp.user || !env.smtp.pass) {
    console.warn("Email ignorado: SMTP_USER ou SMTP_PASS não configurados.");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html: htmlTemplate(title, body),
      attachments,
    });
    if (env.nodeEnv !== "production") {
      const hasQr = attachments?.some((a) => a.cid);
      console.log(
        `Email enviado para ${to} (messageId: ${info.messageId}${hasQr ? ", com QR inline" : ""})`,
      );
    }
  } catch (error) {
    console.error(`Falha ao enviar email para ${to}:`, error.message);
    if (throwOnError) throw error;
  }
}

/** E-mail simples (moedas, cadastro, etc.) — sem QR Code. */
export async function sendMail({ to, subject, title, body, throwOnError = false }) {
  await deliverMail({ to, subject, title, body, throwOnError });
}

function isLocalUrl(url) {
  return /localhost|127\.0\.0\.1/i.test(url || "");
}

/**
 * E-mail de resgate — QR com o código do cupom.
 * @param {string} qrContent Texto codificado no QR (ex.: código do cupom)
 * @param {string} [publicQrImageUrl] URL pública da API que retorna o PNG
 */
export async function sendMailWithQrCode({
  to,
  subject,
  title,
  body,
  qrContent,
  publicQrImageUrl,
  throwOnError = false,
}) {
  if (!qrContent) {
    console.warn("sendMailWithQrCode sem qrContent; enviando sem QR.");
    return sendMail({ to, subject, title, body, throwOnError });
  }

  let finalBody = body;
  let attachments;

  try {
    const imgBuffer = await QRCode.toBuffer(String(qrContent), {
      type: "png",
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    const cid = `qrcode-${Date.now()}@sme.local`;
    attachments = [
      {
        filename: "qrcode-cupom.png",
        content: imgBuffer,
        cid,
        contentType: "image/png",
        contentDisposition: "inline",
      },
    ];

    const hostedQr =
      publicQrImageUrl && !isLocalUrl(publicQrImageUrl) ? publicQrImageUrl : null;
    const imgSrc = hostedQr || `cid:${cid}`;

    finalBody += `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:24px;border-top:1px solid #e2e8f0;padding-top:20px">
        <tr>
          <td align="center">
            <p style="color:#475569;font-size:14px;margin:0 0 12px"><strong>Troca presencial:</strong> apresente este QR Code</p>
            <img src="${imgSrc}" alt="QR Code do cupom" width="200" height="200" style="display:block;width:200px;height:200px;border-radius:8px;border:1px solid #e2e8f0;padding:8px;background:#fff" />
            ${
              publicQrImageUrl
                ? `<p style="color:#64748b;font-size:12px;margin:12px 0 0">Se a imagem não carregar, <a href="${publicQrImageUrl}">abra o QR Code no navegador</a>.</p>`
                : ""
            }
          </td>
        </tr>
      </table>
    `;
  } catch (err) {
    console.error("Falha ao gerar QR Code para o email:", err.message);
    if (throwOnError) throw err;
    return sendMail({ to, subject, title, body, throwOnError });
  }

  await deliverMail({ to, subject, title, body: finalBody, attachments, throwOnError });
}
