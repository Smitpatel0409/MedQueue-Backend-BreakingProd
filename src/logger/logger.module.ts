import { Module, Global } from '@nestjs/common';
import { AppLoggerService } from './logger.service';

@Global() // 👈 Makes the module available globally
@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}
