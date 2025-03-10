import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import envConfig from '../common/config/config';
import { AuthenticateModule } from '../authentication/authenticate.module';
import { CONFIG_KEYS, APP_CONSTANTS } from '../common/config/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === APP_CONSTANTS.PRODUCTION ? '.env.prod' : '.env.local',
      isGlobal: true,
      load: [envConfig],
    }),
    MongooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          uri: configService.get<string>(CONFIG_KEYS.MONGO_URI),
        }),
      }),
    AuthenticateModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
