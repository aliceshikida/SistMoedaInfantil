import { sendMail, sendMailWithQrCode } from "../services/email.service.js";
import { env } from "../config/env.js";
import { closeRabbitMq, getChannel, isRabbitMqConfigured } from "./rabbitmq.js";

async function processEmailJob(job) {
  if (job.type === "mail") {
    await sendMail({ ...job.payload, throwOnError: true });
    return;
  }

  if (job.type === "mail_qr") {
    await sendMailWithQrCode({ ...job.payload, throwOnError: true });
    return;
  }

  throw new Error(`Tipo de job desconhecido: ${job.type}`);
}

export async function startEmailWorker() {
  if (!isRabbitMqConfigured()) {
    console.error("RABBITMQ_URL não configurada. Defina a variável para iniciar o worker.");
    process.exit(1);
  }

  const ch = await getChannel();
  ch.prefetch(1);

  console.log(`Worker de e-mail ouvindo fila "${env.rabbitmq.emailQueue}"`);

  ch.consume(env.rabbitmq.emailQueue, async (message) => {
    if (!message) return;

    try {
      const job = JSON.parse(message.content.toString());
      await processEmailJob(job);
      ch.ack(message);
    } catch (error) {
      console.error("Falha ao processar e-mail da fila:", error.message);
      ch.nack(message, false, false);
    }
  });

  const shutdown = async () => {
    console.log("Encerrando worker de e-mail...");
    await closeRabbitMq();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
