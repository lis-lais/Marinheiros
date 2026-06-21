import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { propagation, context } from '@opentelemetry/api';
import { logger } from '../../utils/structured-logger';

@Injectable()
export class SailorCreatedConsumer implements OnModuleInit {
  constructor(private readonly rabbit: RabbitMQService) {}

  async onModuleInit() {
    const ch = this.rabbit.getChannel();
    if (!ch) return;
    await ch.consume('sailor.created', (msg) => {
      if (!msg) return;
      
      const headers = msg.properties.headers || {};
      const parentContext = propagation.extract(context.active(), headers);
      
      context.with(parentContext, () => {
        try {
          const payload = JSON.parse(msg.content.toString());
          logger.info('Received sailor.created', { eventPayload: payload });
        } catch (e) {
          // ignore
        } finally {
          ch.ack(msg);
        }
      });
    });
  }
}
