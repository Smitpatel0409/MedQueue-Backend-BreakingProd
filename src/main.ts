import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppLoggerService } from './logger/logger.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: (origin, callback) => {
      if (origin) {
        callback(null, true);
      } else {
        callback(null, '*');
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  // await app.register(fastifyCookie);
  // await app.register(require('@fastify/multipart'), {
  //   limits: {
  //     fileSize: 5 * 1024 * 1024, // 5MB
  //   },
  // });
  const appLogger = app.get(AppLoggerService);
  app.useLogger(appLogger);
  const config = new DocumentBuilder()
    .setTitle('BREAKING PROD API')
    .setDescription('The BREAKING PROD API description')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT!, '0.0.0.0');
  appLogger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
