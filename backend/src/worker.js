import { startEmailWorker } from "./queue/email.worker.js";

startEmailWorker().catch((error) => {
  console.error("Worker de e-mail encerrado com erro:", error.message);
  process.exit(1);
});
