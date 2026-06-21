import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import { IEventPublisher } from '../../domain/ports/event-publisher.interface';
import { propagation, context } from '@opentelemetry/api';

@Injectable()
export class RabbitMQService implements IEventPublisher, OnModuleInit, OnModuleDestroy {
  private conn?: any;
  private channel?: any;
  private url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  async onModuleInit() {
    const rawConn = await connect(this.url);
    this.conn = rawConn as any;
    if (this.conn) {
      this.channel = await this.conn.createChannel();
      await this.channel.assertQueue('sailor.created', { durable: true });
    }
  }

  async publish(queue: string, msg: object): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    const headers: Record<string, any> = {};
    propagation.inject(context.active(), headers);
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), {
      persistent: true,
      headers
    });
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => {});
    if (this.conn) {
      await this.conn.close().catch(() => {});
    }
  }
}
