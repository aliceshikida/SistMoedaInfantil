import { publishEmailJob } from "../queue/email.publisher.js";
import { sendMail, sendMailWithQrCode } from "./email.service.js";
import { env } from "../config/env.js";

async function dispatchOrEnqueue(type, payload) {
  if (env.rabbitmq.url) {
    try {
      const published = await publishEmailJob({ type, payload });
      if (published) return;
    } catch (error) {
      console.warn(`RabbitMQ indisponível (${error.message}); enviando e-mail direto.`);
    }
  }

  if (type === "mail") {
    await sendMail(payload);
    return;
  }

  await sendMailWithQrCode(payload);
}

export function enqueueMail(payload) {
  return dispatchOrEnqueue("mail", payload);
}

export function enqueueMailWithQrCode(payload) {
  return dispatchOrEnqueue("mail_qr", payload);
}
