import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GatewayController } from './controllers/gateway.controller';
import { AuthController } from './controllers/auth.controller';
import { SailorProxyService } from './services/sailor-proxy.service';
import { ScheduleProxyService } from './services/schedule-proxy.service';
import { HealthController } from './controllers/health.controller';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-key-marinheiros-9988',
      signOptions: { expiresIn: '1d' }
    })
  ],
  controllers: [GatewayController, AuthController, HealthController],
  providers: [SailorProxyService, ScheduleProxyService, JwtStrategy]
})
export class AppModule {}
