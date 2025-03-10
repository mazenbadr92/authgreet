import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticateController } from './authenticate.controller';
import { AuthenticateService } from './authenticate.service';
import { JwtStrategy } from '../tokenization/strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { TokenController } from '../tokenization/token.controller';
import { TokenService } from '../tokenization/token.service';
import { CONFIG_KEYS, JWT_CONSTANTS } from '../common/config/constants';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>(CONFIG_KEYS.ACCESS_JWT_SECRET);
        const expiresIn =
          configService.get<string>(CONFIG_KEYS.ACCESS_JWT_EXPIRES_IN) || JWT_CONSTANTS.FIVE_MINUTES;
        // Log the JWT configuration details
        const jwtLogger = new Logger('JwtModuleFactory');
        jwtLogger.log(`Configuring JWT Module with expiresIn=${expiresIn}`);
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthenticateController, TokenController],
  providers: [AuthenticateService, TokenService, JwtStrategy],
})
export class AuthenticateModule {
  private readonly logger = new Logger(AuthenticateModule.name);
  constructor() {
    this.logger.log('AuthenticateModule has been initialized');
  }
}
