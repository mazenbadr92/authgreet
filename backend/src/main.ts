import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { APP_CONSTANTS, CONFIG_KEYS } from './common/config/constants';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: APP_CONSTANTS.LOCAL_APP_FRONTEND_URL,
    credentials: true,
  });
  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AuthGreet API')
    .setDescription('API documentation for the AuthGreet project')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalInterceptors(new LoggingInterceptor());
  const configService = app.get(ConfigService);
  const port = configService.get<number>(CONFIG_KEYS.PORT) || 3000;

  await app.listen(port);
  process.on('SIGTERM', () => app.close());
  process.on('SIGINT', () => app.close());
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
