import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import { logger } from '../../utils/structured-logger';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private conn?: any;
  private channel?: any;
  private url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  async onModuleInit() {
    try {
      const rawConn = await connect(this.url);
      this.conn = rawConn as any;
      if (this.conn) {
        this.channel = await this.conn.createChannel();
        await this.channel.assertQueue('sailor.created', { durable: true });
        logger.info('Successfully connected to RabbitMQ and asserted queue sailor.created');
      }
    } catch (error: any) {
      logger.warn('Failed to connect to RabbitMQ. Service will run without messaging broker.', { error: error.message });
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
