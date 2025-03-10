import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CONFIG_KEYS } from '../common/config/constants';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(CONFIG_KEYS.ACCESS_JWT_SECRET),
        signOptions: {
          expiresIn: configService.get<string>(CONFIG_KEYS.ACCESS_JWT_EXPIRES_IN),
        },
      }),
    }),
  ],
  controllers: [TokenController],
  providers: [TokenService, JwtStrategy],
  exports: [TokenService],
})
export class TokenModule {}