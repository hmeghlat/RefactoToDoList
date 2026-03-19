import { connect, type Channel, type ConsumeMessage } from "amqplib";

const EXCHANGE = "events";

export type Subscription = {
  queue: string;
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

export const connectRabbit = async (): Promise<{ connection: Awaited<ReturnType<typeof connect>>; channel: Channel }> => {
  const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";
  const connection = await connectWithRetry(url);
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  return { connection, channel };
};

export const subscribe = async (params: {
  channel: Channel;
  routingKeys: string[];
  onMessage: (msg: ConsumeMessage) => Promise<void> | void;
}): Promise<Subscription> => {
  const { channel, routingKeys, onMessage } = params;

  const { queue } = await channel.assertQueue("", { exclusive: true });
  for (const key of routingKeys) {
    await channel.bindQueue(queue, EXCHANGE, key);
  }

  await channel.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      await onMessage(msg);
      channel.ack(msg);
    } catch (error) {
      console.error("notification-service handler error:", error);
      channel.nack(msg, false, false);
    }
  });

  const close = async () => {
    await channel.deleteQueue(queue).catch(() => {});
  };

  return { queue, close };
};

export const safeJson = (msg: ConsumeMessage): unknown => {
  try {
    return JSON.parse(msg.content.toString("utf8"));
  } catch {
    return { raw: msg.content.toString("utf8") };
  }
};
