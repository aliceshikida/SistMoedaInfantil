import { sendMail } from "../src/services/email.service.js";
import { env } from "../src/config/env.js";

async function main() {
  try {
    await sendMail({
      to: env.smtp.user,
      subject: "Teste SMTP — QR Code",
      title: "Teste de envio com QR Code",
      body: "<p>Este é um email de teste enviado pelo backend.</p>",
      linkQrCode: `${env.frontendUrl || 'http://localhost:5173'}/test-email`
    });
    console.log("Email de teste enviado com sucesso para", env.smtp.user);
  } catch (err) {
    console.error("Falha ao enviar email de teste:", err);
    process.exit(1);
  }
}

main();
