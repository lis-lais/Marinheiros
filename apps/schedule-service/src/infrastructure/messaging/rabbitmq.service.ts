import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
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

  getChannel(): Channel | undefined {
    return this.channel;
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => {});
    if (this.conn) {
      await this.conn.close().catch(() => {});
    }
  }
}
