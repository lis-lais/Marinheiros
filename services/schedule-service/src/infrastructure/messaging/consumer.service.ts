import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class SailorCreatedConsumer implements OnModuleInit {
  constructor(private readonly rabbit: RabbitMQService) {}

  async onModuleInit() {
    const ch = this.rabbit.getChannel();
    if (!ch) return;
    await ch.consume('sailor.created', (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        // For now just log; future: persist or enrich domain
        // eslint-disable-next-line no-console
        console.log('Received sailor.created:', payload);
      } catch (e) {
        // ignore
      } finally {
        ch.ack(msg);
      }
    });
  }
}
