import { Global, Module } from '@nestjs/common';
import { MinioStorageService } from './minio-storage.service';
import { MinioModule, MinioService } from 'nestjs-minio-client';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const endPoint = configService.get<string>('MINIO_ENDPOINT')!;
        const port = +configService.get<number>('MINIO_PORT')!;
        const useSSL = configService.get<boolean>('MINIO_USE_SSL', false);
        const accessKey = configService.get<string>('MINIO_ACCESSKEY')!;
        const secretKey = configService.get<string>('MINIO_SECRETKEY')!;
        const pathStyle = configService.get<boolean>('MINIO_PATH_STYLE', true);

        return {
          endPoint,
          port,
          useSSL,
          accessKey,
          secretKey,
        };
      },
    }),
  ],
  providers: [MinioStorageService,ConfigService],
  exports: [MinioStorageService,MinioModule],
})
export class MinioClientModule {}
