import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomLoggerMiddleware } from './middleware/logger.middleware';
import { PrismaModule } from './database/postgres/prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [AppConfigModule,     PrismaModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CustomLoggerMiddleware).forRoutes('*');
  }
}
