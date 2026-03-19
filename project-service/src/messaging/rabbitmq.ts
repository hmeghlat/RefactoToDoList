import { connect, type Channel, type ConsumeMessage } from "amqplib";

import type { OutgoingEvent } from "./events.js";
import { routingKeyForOutgoing } from "./events.js";

const EXCHANGE = "events";

export type RabbitContext = {
  connection: Awaited<ReturnType<typeof connect>>;
  channel: Channel;
  publish: (event: OutgoingEvent) => void;
  close: () => Promise<void>;
};

const connectWithRetry = async (url: string, retries = 10, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await connect(url);
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`RabbitMQ not ready, retrying in ${delayMs}ms... (${attempt}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Could not connect to RabbitMQ after max retries");
};

export const connectRabbit = async (): Promise<RabbitContext> => {
  const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
  const connection = await connectWithRetry(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  const publish = (event: OutgoingEvent) => {
    const payload = Buffer.from(JSON.stringify(event));
    channel.publish(EXCHANGE, routingKeyForOutgoing(event), payload, {
      contentType: "application/json",
      persistent: true,
      type: event.type,
      timestamp: Date.now(),
    });
  };

  const close = async () => {
    try {
      await channel.close();
    } finally {
      await connection.close();
    }
  };

  return { connection, channel, publish, close };
};

export const safeJson = <T>(msg: ConsumeMessage): T | null => {
  try {
    return JSON.parse(msg.content.toString("utf8")) as T;
  } catch {
    return null;
  }
};

export const subscribe = async (params: {
  channel: Channel;
  routingKeys: string[];
  onMessage: (msg: ConsumeMessage) => Promise<void> | void;
}): Promise<{ queue: string }> => {
  const { channel, routingKeys, onMessage } = params;

  const { queue } = await channel.assertQueue("", { exclusive: true });
  for (const key of routingKeys) {
    await channel.bindQueue(queue, EXCHANGE, key);
  }

  await channel.consume(queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return;
    try {
      await onMessage(msg);
      channel.ack(msg);
    } catch (error) {
      console.error("project-service event handler error:", error);
      channel.nack(msg, false, false);
    }
  });

  return { queue };
};
