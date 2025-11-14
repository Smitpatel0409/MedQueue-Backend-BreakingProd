// error-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponse<T> {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional({ example: 'Bad Request' })
  error?: T;

  @ApiProperty({ example: Date.now() })
  timestamp: number;

  constructor(statusCode: number, message: string, data?: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = data;
    this.timestamp = Date.now();
  }
}
