import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEYS } from '../../common/config/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      // Extract the JWT from the Authorization header in the format: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(CONFIG_KEYS.ACCESS_JWT_SECRET),
    });
  }

  async validate(payload: any) {
    // The returned object is attached to req.user in controllers using the JwtAuthGuard
    return { userId: payload.sub, email: payload.email };
  }
}
