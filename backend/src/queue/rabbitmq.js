import amqp from "amqplib";
import { env } from "../config/env.js";

let connection = null;
let channel = null;

export function isRabbitMqConfigured() {
  return Boolean(env.rabbitmq.url);
}

export async function getChannel() {
  if (!isRabbitMqConfigured()) return null;
  if (channel) return channel;

  connection = await amqp.connect(env.rabbitmq.url);
  channel = await connection.createChannel();
  await channel.assertQueue(env.rabbitmq.emailQueue, { durable: true });

  connection.on("error", (error) => {
    console.error("RabbitMQ connection error:", error.message);
  });

  connection.on("close", () => {
    connection = null;
    channel = null;
  });

  return channel;
}

export async function closeRabbitMq() {
  try {
    await channel?.close();
    await connection?.close();
  } finally {
    channel = null;
    connection = null;
  }
}
