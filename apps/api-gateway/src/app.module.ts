import { Module } from '@nestjs/common';
import { GatewayController } from './controllers/gateway.controller';
import { SailorProxyService } from './services/sailor-proxy.service';
import { ScheduleProxyService } from './services/schedule-proxy.service';
import { HealthController } from './controllers/health.controller';

@Module({
  controllers: [GatewayController, HealthController],
  providers: [SailorProxyService, ScheduleProxyService]
})
export class AppModule {}
