import { env } from "../config/env.js";
import { getChannel } from "./rabbitmq.js";

export async function publishEmailJob(job) {
  const ch = await getChannel();
  if (!ch) return false;

  ch.sendToQueue(env.rabbitmq.emailQueue, Buffer.from(JSON.stringify(job)), {
    persistent: true,
    contentType: "application/json",
  });

  return true;
}
