import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SailorProxyService } from '../services/sailor-proxy.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly sailorProxy: SailorProxyService,
    private readonly jwtService: JwtService
  ) {}

  @Post('register')
  async register(@Body() body: Record<string, unknown>) {
    return this.sailorProxy.createSailor(body);
  }

  @Post('login')
  async login(@Body() body: Record<string, string>) {
    const sailor = await this.sailorProxy.authenticateSailor(body);
    if (!sailor) {
      throw new HttpException('Credenciais inválidas.', HttpStatus.UNAUTHORIZED);
    }
    const payload = { sub: sailor.id, email: sailor.email };
    const token = this.jwtService.sign(payload);
    return {
      accessToken: token,
      sailor: {
        id: sailor.id,
        fullName: sailor.fullName,
        email: sailor.email,
        rank: sailor.rank
      }
    };
  }
}
