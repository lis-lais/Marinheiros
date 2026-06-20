import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private conn?: Connection;
  private channel?: Channel;
  private url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  async onModuleInit() {
    this.conn = await connect(this.url);
    this.channel = await this.conn.createChannel();
    await this.channel.assertQueue('sailor.created', { durable: true });
  }

  async publish(queue: string, msg: object) {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), { persistent: true });
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => {});
    await this.conn?.close().catch(() => {});
  }
}
