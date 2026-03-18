import { connect, type Channel } from "amqplib";

import type { DomainEvent } from "./events.js";
import { getRoutingKey as eventRoutingKey } from "./events.js";

const EXCHANGE = "events";

export type RabbitClient = {
  channel: Channel;
  publishEvent: (event: DomainEvent) => void;
  close: () => Promise<void>;
};

export const connectRabbit = async (): Promise<RabbitClient> => {
  const url = process.env.RABBITMQ_URL || "amqp://localhost:5672";

  const connection = await connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  const publishEvent = (event: DomainEvent) => {
    const payload = Buffer.from(JSON.stringify(event));
    const routingKey = eventRoutingKey(event);
    channel.publish(EXCHANGE, routingKey, payload, {
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
      await (connection as { close?: () => Promise<void> }).close?.();
    }
  };

  return { channel, publishEvent, close };
};
