import { sendMail, sendMailWithQrCode } from "../src/services/email.service.js";
import { env } from "../src/config/env.js";

const mode = process.argv[2] || "moedas";

async function main() {
  try {
    if (mode === "qr" || mode === "resgate") {
      const apiBase = (env.apiPublicUrl || "http://localhost:4000").replace(/\/$/, "");
      const codigoTeste = "TESTE-QR-1234";
      await sendMailWithQrCode({
        to: env.smtp.user,
        subject: "Teste — cupom com QR Code",
        title: "Cupom para troca presencial (teste)",
        body: "<p>Este e-mail simula o resgate de uma vantagem e deve incluir QR Code.</p>",
        qrContent: codigoTeste,
        publicQrImageUrl: `${apiBase}/api/public/cupom/${encodeURIComponent(codigoTeste)}/qr.png`,
        throwOnError: true,
      });
      console.log("Email de resgate (com QR) enviado para", env.smtp.user);
      return;
    }

    await sendMail({
      to: env.smtp.user,
      subject: "Teste — você recebeu moedas",
      title: "Novas moedas na sua conta (teste)",
      body: "<p>Este e-mail simula o recebimento de moedas de um professor. <strong>Não deve ter QR Code.</strong></p>",
      throwOnError: true,
    });
    console.log("Email de moedas (sem QR) enviado para", env.smtp.user);
  } catch (err) {
    console.error("Falha ao enviar email de teste:", err);
    process.exit(1);
  }
}

main();
