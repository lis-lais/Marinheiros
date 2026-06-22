import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret-key-marinheiros-9988'
    });
  }

  async validate(payload: { sub: string; email: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido.');
    }
    return { userId: payload.sub, email: payload.email };
  }
}
