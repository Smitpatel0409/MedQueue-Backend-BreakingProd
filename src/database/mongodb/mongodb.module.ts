import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // const uri = configService.get<string>('mongodb://localhost:27017/hms_db'); // ✅ Use ENV variable format
        // const uri = process.env.MONGO_URI
        const uri = configService.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error(
            'MongoDB URI is not defined in environment variables',
          );
        }
        return {
          uri,
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class MongooseDatabaseModule {}
